-- 內容多語系：
-- 1. 專案：英文放在原欄位，其他語系放在 translations（{"zh-TW": {"title", "description", "tags"}}），缺的欄位前端退回英文。
-- 2. 文章：同一篇文章的不同語系版本共用 slug，各自一列，由 (slug, lang) 區分。

alter table website.articles drop constraint if exists articles_slug_key;
alter table website.articles drop constraint if exists articles_slug_lang_key;
alter table website.articles add constraint articles_slug_lang_key unique (slug, lang);

-- projects 表不在本 repo 的 migration 內建立，全新資料庫上直接略過。
do $$
begin
  if to_regclass('website.projects') is null then
    return;
  end if;

  alter table website.projects
    add column if not exists translations jsonb not null default '{}'::jsonb;

  alter table website.projects drop constraint if exists projects_translations_object;
  alter table website.projects
    add constraint projects_translations_object check (jsonb_typeof(translations) = 'object');

  update website.projects p
  set translations = p.translations || jsonb_build_object('zh-TW', t.zh)
  from (values
    ('seamless-track', jsonb_build_object(
      'title', '無感記帳',
      'description', '本地優先的 Android 記帳 App，把金融通知自動轉成交易紀錄。自訂擷取規則、多帳戶管理、統計分析、定期記帳，以及可選的加密 Google Drive 備份，讓日常記帳保持有用，也不再是每天的苦差事。',
      'tags', jsonb_build_array('自動記帳', '本地優先', 'Android'))),
    ('driftread', jsonb_build_object(
      'description', '一個 RSS 探索與閱讀平台，核心想法很簡單：幫你找到還不認識、但很可能會喜歡的來源。瀏覽、閱讀全文、訂閱、匯入 OPML、探索新的 feed，閱讀不必變成另一條吵雜的時間軸。',
      'tags', jsonb_build_array('RSS', '探索', '閱讀'))),
    ('cotime-book', jsonb_build_object(
      'description', '為想要遠端一起讀書的人設計的協作 EPUB 閱讀 App。建立房間、分享六碼代碼，閱讀進度即時同步，大家都停在同一頁。',
      'tags', jsonb_build_array('共讀', 'EPUB', '即時同步'))),
    ('hitcon-crawl', jsonb_build_object(
      'description', '在終端機瀏覽 HITCON 漏洞揭露的快速 TUI 工具。給資安研究者一個有效率的命令列介面，快速查閱已公開揭露的漏洞。',
      'tags', jsonb_build_array('Python', 'TUI', '資安研究'))),
    ('hookfy', jsonb_build_object(
      'description', '支援 webhook 的 Android 通知監聽 App。即時轉發與追蹤通知，強化行動裝置上的工作流程自動化。',
      'tags', jsonb_build_array('Flutter', '行動裝置', 'Webhooks'))),
    ('lazyembed', jsonb_build_object(
      'description', '收錄各種網頁開發小工具的靜態網頁工具箱，用簡單的介面處理常見的網頁開發雜事。',
      'tags', jsonb_build_array('HTML', 'JavaScript', '網頁工具')))
  ) as t(slug, zh)
  where p.slug = t.slug;

  -- 原欄位改放英文名稱，中文名稱已移到 translations。
  update website.projects set title = 'Seamless Track' where slug = 'seamless-track' and title = '無感記帳';
end;
$$;

notify pgrst, 'reload schema';
