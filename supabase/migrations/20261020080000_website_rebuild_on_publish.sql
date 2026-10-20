-- 公開內容變動後重新建置網站：作品頁與文章頁是建置時預渲染的，資料改了要重建才會更新。
-- Vercel Deploy Hook 網址放在 Vault，名稱 vercel_deploy_hook；沒有設定時觸發器什麼都不做。
--   select vault.create_secret('https://api.vercel.com/v1/integrations/deploy/...', 'vercel_deploy_hook');
-- 重建前，新發布的文章仍由瀏覽器端載入（csr.html），不會 404。

create extension if not exists pg_net;

-- 每個 SQL 陳述式最多送一次請求，批次匯入或批次撤稿不會觸發多次建置。
create or replace function website_private.request_site_rebuild()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  hook text;
  affects_public boolean := true;
begin
  -- 只有已發布文章的新增、修改、撤稿與刪除會改變公開頁面；草稿編輯不重建。
  if tg_table_name = 'articles' then
    if tg_op = 'INSERT' then
      affects_public := exists (select 1 from new_rows where status = 'published');
    elsif tg_op = 'UPDATE' then
      affects_public := exists (select 1 from new_rows where status = 'published')
        or exists (select 1 from old_rows where status = 'published');
    else
      affects_public := exists (select 1 from old_rows where status = 'published');
    end if;
  end if;

  if not affects_public then
    return null;
  end if;

  select s.decrypted_secret into hook
  from vault.decrypted_secrets s
  where s.name = 'vercel_deploy_hook'
  limit 1;

  if coalesce(hook, '') = '' then
    return null;
  end if;

  -- pg_net 在交易提交後才送出請求；回滾的變更不會觸發建置。
  perform net.http_post(url := hook, body := '{}'::jsonb);
  return null;
end;
$$;

revoke all on function website_private.request_site_rebuild() from public, anon, authenticated;

-- 有 transition table 的觸發器只能對應一種事件，所以分成三個。
drop trigger if exists articles_request_rebuild on website.articles;
drop trigger if exists articles_insert_request_rebuild on website.articles;
drop trigger if exists articles_update_request_rebuild on website.articles;
drop trigger if exists articles_delete_request_rebuild on website.articles;
create trigger articles_insert_request_rebuild
  after insert on website.articles
  referencing new table as new_rows
  for each statement execute function website_private.request_site_rebuild();
create trigger articles_update_request_rebuild
  after update on website.articles
  referencing old table as old_rows new table as new_rows
  for each statement execute function website_private.request_site_rebuild();
create trigger articles_delete_request_rebuild
  after delete on website.articles
  referencing old table as old_rows
  for each statement execute function website_private.request_site_rebuild();

-- projects 表不在本 repo 的 migration 內建立，全新資料庫上直接略過。
do $$
begin
  if to_regclass('website.projects') is null then
    return;
  end if;

  drop trigger if exists projects_request_rebuild on website.projects;
  create trigger projects_request_rebuild
    after insert or update or delete on website.projects
    for each statement execute function website_private.request_site_rebuild();
end;
$$;
