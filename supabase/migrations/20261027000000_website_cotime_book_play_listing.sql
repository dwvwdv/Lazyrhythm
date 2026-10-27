-- 頁間（CoTime Book）原始碼轉為私有：作品連結改指向 Google Play，中文名稱放進 translations。

-- projects 表不在本 repo 的 migration 內建立，全新資料庫上直接略過。
do $$
begin
  if to_regclass('website.projects') is null then
    return;
  end if;

  update website.projects
  set project_url = 'https://play.google.com/store/apps/details?id=com.lazyrhythm.cotime_book',
      translations = jsonb_set(translations, '{zh-TW,title}', to_jsonb('頁間'::text), true)
  where slug = 'cotime-book';
end;
$$;
