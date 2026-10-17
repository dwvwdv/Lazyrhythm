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

- 七個公開頁面具備各自的初始 HTML、title、description、canonical、OG 與品牌 JSON-LD；瀏覽器導覽及語系切換會同步更新。
- `SeoService` 集中管理 head，去除重複標籤；文章採實際已發布版本的標題、摘要、封面與語系。Article JSON-LD 僅填存在的作者與有效日期。
- 文章載入中、錯誤、不存在、草稿及管理頁使用 `noindex, follow`，避免沿用上一頁文章資訊。現有公開文章查詢仍僅讀取 published；未更動 Auth、資料庫或 RLS。
- `sitemap.xml` 為 sitemap index：`sitemap-pages.xml` 於建置時列出七個公開頁面；`sitemap-articles.xml` 由 Supabase Edge Function `sitemap-articles` 即時列出已發布文章（同 slug 的多語版本合併為一個 URL，`lastmod` 取最新更新時間），發布後不需重新部署，快取 10 分鐘。不列管理頁或草稿。資料庫無法讀取時回 503，爬蟲會稍後重試。
- 單 URL 維持中英文切換；預渲染固定英文，瀏覽器啟動後套用使用者偏好，不宣告不存在的語系 URL 或 hreflang。
- 預渲染 HTML 不寫入主題，由 CSS 跟隨系統配色，`index.html` 的 inline script 在首次繪製前套用已儲存的主題；瀏覽器以 hydration 重用靜態 DOM，不會整頁重畫。
- 預設分享圖為 1024×1024 logo，使用 `summary` 卡片並宣告尺寸；只有文章具封面圖時才用 `summary_large_image`。About 與 Art 使用專用的短描述，避免搜尋摘要被截斷。
- 文章詳情維持 CSR，初始 `csr.html` 無首頁 canonical 或初始 noindex。未執行 JavaScript 的社群爬蟲無法取得文章專屬分享資訊；若要支援，需另加發布時文章預渲染及重建機制，或文章 SSR。
- 靜態主機無法判斷文章是否存在：未知 slug 回應 200，再由瀏覽器設定 noindex；真正的文章 HTTP 404 需由 server 層判斷。其他未知路徑由 `vercel.json` 最後一條 rewrite 回應首頁（200，canonical 指向首頁）；這是刻意保留的行為，Search Console 可能將其列為軟 404，不需處理。

## 建置與部署驗證

```sh
npm ci
npm run build
CHROME_BIN=/path/to/chrome npm test -- --watch=false --browsers=ChromeHeadless
```

`npm run build` 會驗證七頁初始 metadata、h1、首頁品牌正文、JSON-LD、hydration 資料、未寫死主題、robots、sitemap 與中性 CSR shell。產物留在 `dist/lazyrhythm`，暫存 server bundle 不需部署。`dist/` 不再納入版本控制，正式站內容以 Vercel 建置結果為準。

Vercel 須採本次 `vercel.json` 的建置命令及 rewrites，避免 Angular preset 只執行 `ng build`。公開頁面回傳預渲染 HTML，動態文章與管理頁使用 `csr.html`；不要將所有路徑 rewrite 至首頁。

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

需確認 apex 直接回應 200，www 以 308 轉向 apex 且保留路徑及查詢參數，HTTP 最終轉向 HTTPS apex，沒有轉址迴圈。另確認首頁及 `/about`、`/works` 的初始 metadata 與正文正確；robots 為文字、`sitemap.xml` 與 `sitemap-articles.xml` 皆為 XML（後者須為 `application/xml`，不可是 Supabase 預設的 `text/plain`）；公開頁與已發布文章沒有意外 `X-Robots-Tag: noindex`、`nosnippet` 或 `max-snippet:0`。管理頁須有 noindex，未知一般路徑回首頁且 canonical 指向首頁。另以瀏覽器確認文章成功後解除 noindex、失敗時保留 noindex，並測試語系切換、返回首頁、p5 重抽及聲音。

## Search Console：部署後由有權限者完成

此修正尚未替代正式部署驗收，也未執行 Search Console 操作。需要有該網域資源權限的 Google 帳號：

1. 對正式首頁執行「網址審查」，記錄索引狀態、使用者宣告及 Google 選定的 canonical。
2. 執行「測試線上網址」，確認可檢索、允許索引，並檢查 Googlebot HTML／渲染結果可讀到品牌介紹。
3. 同樣抽查 `/about`、`/works` 與一篇已發布文章；文章必須在 Googlebot 執行 JavaScript 後顯示真實內容與 metadata。
4. 提交 `https://lazyrhythm.com/sitemap.xml`，對首頁要求重新建立索引，記錄日期與結果。
5. 重新檢索後觀察品牌搜尋。摘要是否顯示及採用哪段文字由 Google 決定，不作為程式碼可保證的結果。

未完成正式部署與上述線上測試前，不應將 issue 的 Search Console 驗收項目標記為完成。
