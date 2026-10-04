-- 文章區：團隊近況 / 開發日誌
-- 只有登錄在 website.authors 的帳號可以撰寫、編輯、刪除；訪客僅能讀取已發布文章。

-- 讓全新資料庫（supabase db reset）也能重建；在既有專案上為 no-op。
create schema if not exists website;
create schema if not exists website_private;

revoke all on schema website_private from public;
revoke all on schema website_private from anon, authenticated;
grant usage on schema website to anon, authenticated;

create table if not exists website.authors (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(btrim(display_name)) between 1 and 80),
  created_at timestamptz not null default now()
);

create table if not exists website.articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique
    check (char_length(slug) between 1 and 120 and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (char_length(btrim(title)) between 1 and 200),
  summary text not null default '' check (char_length(summary) <= 500),
  content text not null default '' check (char_length(content) <= 100000),
  cover_image_url text check (cover_image_url is null or cover_image_url ~ '^https://'),
  tags text[] not null default '{}' check (cardinality(tags) <= 12),
  lang text not null default 'zh-TW' check (lang in ('zh-TW', 'en')),
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  author_id uuid references auth.users(id) on delete set null,
  author_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists articles_published_idx
  on website.articles (published_at desc)
  where status = 'published';

-- 作者欄位由伺服器端決定，避免客戶端偽造；發布時自動補上發布時間。
create or replace function website_private.prepare_article()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    new.author_id := auth.uid();
    new.author_name := (select a.display_name from website.authors a where a.user_id = auth.uid());
    new.created_at := now();
  else
    new.author_id := old.author_id;
    new.author_name := old.author_name;
    new.created_at := old.created_at;
  end if;

  if new.status = 'published' and new.published_at is null then
    new.published_at := now();
  end if;

  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists articles_prepare on website.articles;
create trigger articles_prepare
  before insert or update on website.articles
  for each row execute function website_private.prepare_article();

alter table website.authors enable row level security;
alter table website.articles enable row level security;

grant select on website.authors to authenticated;
grant select on website.articles to anon, authenticated;
grant insert, update, delete on website.articles to authenticated;

drop policy if exists authors_self_read on website.authors;
create policy authors_self_read on website.authors
  for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists articles_public_read on website.articles;
create policy articles_public_read on website.articles
  for select to anon, authenticated
  using (status = 'published' and published_at <= now());

drop policy if exists articles_author_read on website.articles;
create policy articles_author_read on website.articles
  for select to authenticated
  using (exists (select 1 from website.authors a where a.user_id = (select auth.uid())));

drop policy if exists articles_author_insert on website.articles;
create policy articles_author_insert on website.articles
  for insert to authenticated
  with check (exists (select 1 from website.authors a where a.user_id = (select auth.uid())));

drop policy if exists articles_author_update on website.articles;
create policy articles_author_update on website.articles
  for update to authenticated
  using (exists (select 1 from website.authors a where a.user_id = (select auth.uid())))
  with check (exists (select 1 from website.authors a where a.user_id = (select auth.uid())));

drop policy if exists articles_author_delete on website.articles;
create policy articles_author_delete on website.articles
  for delete to authenticated
  using (exists (select 1 from website.authors a where a.user_id = (select auth.uid())));

notify pgrst, 'reload schema';
