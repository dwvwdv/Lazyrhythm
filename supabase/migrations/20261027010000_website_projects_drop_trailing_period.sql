-- 作品中文描述不以全形句號結尾，跟網站其他文案一致。

-- projects 表不在本 repo 的 migration 內建立，全新資料庫上直接略過。
do $$
begin
  if to_regclass('website.projects') is null then
    return;
  end if;

  update website.projects
  set translations = jsonb_set(translations, '{zh-TW,description}',
        to_jsonb(regexp_replace(translations #>> '{zh-TW,description}', '。+$', '')))
  where translations #>> '{zh-TW,description}' ~ '。$';
end;
$$;
