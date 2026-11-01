# SEO 驗證與部署（Issue #14）

## 已查證的正式站狀態

2026-10-16 部署前檢查：

- `https://www.lazyrhythm.com/` 回應 200。
- `https://lazyrhythm.com/` 以 308 轉向 www；HTTP 先以 301 轉向 HTTPS。
- 首頁初始 HTML 只有 Angular root，缺少 description、canonical 與 OG；未見 `X-Robots-Tag` 或禁止摘要的指令。
- `/robots.txt` 與 `/sitemap.xml` 當時回應 200 `text/html`，內容與首頁相同，屬於 SPA fallback。
- `/assets/logo.png` 回應 200 `image/png`，可用作絕對 OG 圖片網址。
- GitHub 最新 Production deployment 由 Vercel 建立，對應提交 `2177181c9a4a4243123aa6a102b5b80901ddc20f`。

上述轉址是調整前的歷史狀態。依品牌擁有者指定，canonical origin 統一採 `https://lazyrhythm.com`。

2026-10-17 已完成網域切換並驗證：`https://lazyrhythm.com/` 直接回應 200；`https://www.lazyrhythm.com/about?x=1` 以 308 轉向 `https://lazyrhythm.com/about?x=1`，保留路徑與查詢參數；`http://www.lazyrhythm.com/about` 經 Cloudflare 301 轉 HTTPS 後再 308 至 apex，最終 200，無轉址迴圈。這些證據確認程式碼缺口，無法直接證明 Google 未顯示摘要的原因。

## 本次程式碼範圍

- 每種語言各有獨立網址：繁體中文在根目錄，英文在 `/en`。七個公開頁面 × 兩種語言共 14 頁，各自具備對應語言的初始 HTML、`<html lang>`、title、description、canonical、OG 與品牌 JSON-LD；瀏覽器導覽及語系切換會同步更新。
- `SeoService` 集中管理 head，去除重複標籤；文章採實際已發布版本的標題、摘要、封面與語系。Article JSON-LD 僅填存在的作者與有效日期。
- 文章載入中、錯誤、不存在、草稿及管理頁使用 `noindex, follow`，避免沿用上一頁文章資訊。現有公開文章查詢仍僅讀取 published；未更動 Auth、資料庫或 RLS。
- `sitemap.xml` 為 sitemap index：`sitemap-pages.xml` 於建置時列出兩種語言的公開頁面並互相標示 alternate；`sitemap-articles.xml` 由 Supabase Edge Function `sitemap-articles` 即時列出已發布文章（每個語言版本各自一個網址與 `lastmod`，兩種語言都存在時互相標示 alternate），發布後不需重新部署，快取 10 分鐘。不列管理頁或草稿。資料庫無法讀取時回 503，爬蟲會稍後重試。
- 語言只由網址決定：每頁宣告兩種語言的 `hreflang`，`x-default` 指向中文；文章只宣告實際存在的語言版本，只有單一語言的文章在另一語言網址顯示時，canonical 指向原語言網址。語系切換鈕會開啟另一語言的同一頁並記住選擇；儲存的選擇或瀏覽器語言與頁面不同時，只顯示可關閉的切換提示，不自動轉址。
- 預渲染 HTML 不寫入主題，由 CSS 跟隨系統配色，`index.html` 的 inline script 在首次繪製前套用已儲存的主題；瀏覽器以 hydration 重用靜態 DOM，不會整頁重畫。
- 預設分享圖為 1024×1024 logo，使用 `summary` 卡片並宣告尺寸；只有文章具封面圖時才用 `summary_large_image`。About 與 Art 使用專用的短描述，避免搜尋摘要被截斷。
- 文章詳情、作品與文章列表的預渲染與 404 見下方「第二階段（Issue #18）」。

## 第二階段（Issue #18）

- 建置時以公開金鑰讀取作品與已發布文章（受 RLS 限制，只讀得到訪客可見的資料），讀取失敗即中止建置，Vercel 保留上一版，不會部署空清單。
- `/works`、`/articles`、首頁精選作品及每篇已發布文章的兩種語言網址，初始 HTML 即含真實內容；文章頁含專屬 title、description、canonical、OG、`Article` JSON-LD，`hreflang` 只列實際存在的語言版本。瀏覽器從頁面內的 transfer state 接手 hydration，再向 Supabase 更新。
- 未知網址回 HTTP 404（`404.html`，`noindex`）；移除首頁 catch-all rewrite。不存在的文章 slug 仍由 `csr.html` 回 200 並在瀏覽器設 `noindex`，因為靜態主機無法分辨「不存在」與「建置後才發布」。
- `Organization` 補上 `description`、`alternateName`（悠閒節奏）與 `sameAs`（Ko-fi 與 Facebook 粉專；個人 GitHub 不屬於品牌帳號所以不列入，其餘帳號確認屬於品牌後再加到 `SITE_SAME_AS`）；`WebSite` 宣告 `inLanguage`。
- 首頁研究領域補上「閱讀與知識」，並列出精選作品、連到作品頁對應卡片。
- `llms.txt` 由同一份資料產生；非 Google / ChatGPT 收錄必要條件。
- 發布後重建：`supabase/migrations/20261020080000_website_rebuild_on_publish.sql`。啟用步驟：
  1. Vercel Project → Settings → Git → Deploy Hooks 建立 Production 分支的 hook。
  2. 套用 migration，並執行 `select vault.create_secret('<hook URL>', 'vercel_deploy_hook');`。
  3. 發布或撤下一篇文章，確認 Vercel 出現由 hook 觸發的部署。
- 2026-10-20 以 GPTBot、OAI-SearchBot、ClaudeBot、PerplexityBot、Googlebot、bingbot 的 User-Agent 請求 `/works` 皆回 200；這只排除以 UA 阻擋，Cloudflare 依 IP 驗證的 bot 規則仍需在 Cloudflare 後台（Security → Bots / AI Crawl Control）確認。
- 產品頁 `/products/:slug`、`/en/products/:slug`：內容放在 repo（`src/app/products/`），建置時預渲染；目前發布有完整內容的無感記帳（`seamless-track`）、頁間（`cotime-book`）與 LazyEmbed（`lazyembed`），其餘作品補齊內容後再加入。產品頁只有中文版時，英文網址顯示中文內容並以 canonical 指回中文網址、不輸出 hreflang，sitemap 只列中文網址。結構化資料為 `WebPage` + `SoftwareApplication`，publisher／author 引用 `Organization` 的 `@id`。`/works` 與首頁以一般超連結連到產品頁，產品頁再連到 Google Play 等外部連結。圖片支援 HTTPS 網址及本機資產；無感記帳、頁間與 LazyEmbed 的 Hero、分享圖、三張功能圖與作品卡封面直接載入作者提供的 pCloud `SeamlessTrack/website/`、`CotimeBook/website/`、`LazyEmbed/website/` 網址，不存入 repo。分享圖維持原始遠端 URL 與 1200×630 尺寸，使用 `summary_large_image`。本機資產仍會在缺檔時略過（og:image 退回 logo）。
- 尚未處理：其他作品的產品頁（需先備妥功能、限制、截圖等實際內容）、站外品牌連結統一、Search Console / Bing 驗收、Core Web Vitals 基線。

## 建置與部署驗證

```sh
npm ci
npm run build
CHROME_BIN=/path/to/chrome npm test -- --watch=false --browsers=ChromeHeadless
```

`npm run build` 會驗證兩種語言共 14 頁及每篇已發布文章的初始 metadata、`<html lang>`、hreflang、h1、首頁品牌正文、JSON-LD、hydration 資料、未寫死主題、robots、sitemap、中性 CSR shell，以及作品／文章的初始內容、文章 canonical 與 hreflang、產品頁的初始內容、metadata、`SoftwareApplication` JSON-LD、canonical、hreflang、sitemap 與圖片檔、404 頁、無 catch-all rewrite 與 `llms.txt`。產物留在 `dist/lazyrhythm`，暫存 server bundle 不需部署。`dist/` 不再納入版本控制，正式站內容以 Vercel 建置結果為準。

Vercel 須採本次 `vercel.json` 的建置命令及 rewrites，避免 Angular preset 只執行 `ng build`。公開頁面與已發布文章回傳預渲染 HTML，建置後才發布的文章與管理頁使用 `csr.html`；不要將所有路徑 rewrite 至首頁。

網域切換須在 Vercel Project → Settings → Domains 完成：

1. 將 `lazyrhythm.com` 設為直接連接此專案的 Production 網域，移除既有轉向 www 的規則。
2. 將 `www.lazyrhythm.com` 設為永久轉址（308）至 `lazyrhythm.com`，保留路徑與 query string；若 Cloudflare 另有相反轉址規則，也須移除。
3. 先確認 apex 可直接回應 200，再啟用 www 轉址並部署本次 canonical 更新，避免來回轉址。（2026-10-17 已依此順序完成。）

部署後檢查公開網址，而非只驗證 repository：

```sh
curl -sS -D - -o /dev/null https://www.lazyrhythm.com/about?source=domain-check
curl -fsSL -D /tmp/home.headers https://lazyrhythm.com/ -o /tmp/home.html
curl -fsSL -D /tmp/robots.headers https://lazyrhythm.com/robots.txt
curl -fsSL -D /tmp/sitemap.headers https://lazyrhythm.com/sitemap.xml
curl -fsSL -D /tmp/sitemap-articles.headers https://lazyrhythm.com/sitemap-articles.xml
curl -sS -D - -o /dev/null https://lazyrhythm.com/articles/manage
curl -sS -D - -o /dev/null https://lazyrhythm.com/articles/PUBLISHED_SLUG
curl -sS -D - -o /dev/null https://lazyrhythm.com/unknown-page
```

需確認 apex 直接回應 200，www 以 308 轉向 apex 且保留路徑及查詢參數，HTTP 最終轉向 HTTPS apex，沒有轉址迴圈。另確認首頁及 `/about`、`/works` 與對應 `/en` 頁面的初始 metadata、hreflang 與正文正確；robots 為文字、`sitemap.xml` 與 `sitemap-articles.xml` 皆為 XML（後者須為 `application/xml`，不可是 Supabase 預設的 `text/plain`）；公開頁與已發布文章沒有意外 `X-Robots-Tag: noindex`、`nosnippet` 或 `max-snippet:0`。管理頁須有 noindex；未知一般路徑（含 `/en/...`）回 404；已發布文章的初始 HTML 須含文章標題與內文（`curl` 即可看到，不需 JavaScript）。另以瀏覽器確認文章成功後解除 noindex、失敗時保留 noindex，並測試語系切換、返回首頁、p5 重抽及聲音。

## Search Console：部署後由有權限者完成

此修正尚未替代正式部署驗收，也未執行 Search Console 操作。需要有該網域資源權限的 Google 帳號：

1. 對正式首頁執行「網址審查」，記錄索引狀態、使用者宣告及 Google 選定的 canonical。
2. 執行「測試線上網址」，確認可檢索、允許索引，並檢查 Googlebot HTML／渲染結果可讀到品牌介紹。
3. 同樣抽查 `/about`、`/works` 與一篇已發布文章；文章必須在 Googlebot 執行 JavaScript 後顯示真實內容與 metadata。
4. 提交 `https://lazyrhythm.com/sitemap.xml`，對首頁要求重新建立索引，記錄日期與結果。
5. 重新檢索後觀察品牌搜尋。摘要是否顯示及採用哪段文字由 Google 決定，不作為程式碼可保證的結果。

未完成正式部署與上述線上測試前，不應將 issue 的 Search Console 驗收項目標記為完成。
