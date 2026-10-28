import { Product } from './product.model';

// Author-provided website images are loaded directly from pCloud.
const dir = 'https://filedn.eu/lyWyjTiBuD9uWONu3Or0JNX/lazyrhythm/LazyEmbed/website';

/**
 * 內容取自 dwvwdv/LazyEmbed 的 index.html 與 widgets/（format-converter、json-filter、image-converter、
 * password-generator、web-inspector、json-table-visualizer、cashflow-visualizer）以及正式站 embed.lazyrhythm.com。
 * README 前半段描述的「小工具管理、localStorage 儲存」是舊版介面（js/app.js），正式站已不使用，不寫進來。
 * repo 沒有 LICENSE 檔：不寫「開源」、不連 GitHub。沒有廣告、帳號或分析追蹤（作者確認）。
 * 「資料在瀏覽器處理」只寫到程式碼做得到的範圍：DNS 查詢會送到 Cloudflare／Google 的 DoH，
 * 部分工具從 CDN 載入函式庫，資金流可視化的嵌入連結會把資料放進網址參數。
 * 工具增減或行為改變時，同步更新這裡與 `updated`。
 */
export const LAZYEMBED: Product = {
  slug: 'lazyembed',
  updated: '2026-10-25',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Web browser',
  free: true,
  articleTag: 'LazyEmbed',
  versions: [{
    lang: 'zh-TW',
    name: 'LazyEmbed',
    title: 'LazyEmbed：免安裝、免登入的瀏覽器開發者工具箱',
    description: 'LazyEmbed 是一組在瀏覽器裡執行的開發者小工具：JSON／YAML／TOML／CSV 互轉並產生 TypeScript 或 C# 型別、JSON 屬性篩選、圖片裁切壓縮轉 WebP、密碼與金鑰產生、DNS 與 Open Graph 檢查。免安裝、免登入',
    eyebrow: 'Web · 開發者工具 · 免登入',
    tagline: '打開網頁就能用的開發者工具箱：貼上資料，立刻得到結果',
    hero: { file: `${dir}/Hero%202400%C3%971200%401x.png`, width: 2400, height: 1200, alt: 'LazyEmbed 首頁畫面：「即開即用的瀏覽器工具」與工具卡片，旁邊是七個工具清單、JSON 轉 TypeScript 介面、PNG 轉 WebP 省下 75% 與隨機密碼的資訊卡' },
    og: { file: `${dir}/OG%20%E5%88%86%E4%BA%AB%E5%9C%96%201200%C3%97630%401x.png`, width: 1200, height: 630, alt: 'LazyEmbed：即開即用的瀏覽器工具，免安裝、免登入，含萬用格式轉換器、JSON Filter、圖片轉換器與密碼產生器' },
    facts: [
      { label: '平台', value: '瀏覽器（Chrome、Edge、Firefox、Safari 的新版本），桌機與手機皆可' },
      { label: '帳號', value: '不需要：免登入、免安裝' },
      { label: '工具', value: '7 個：格式轉換、JSON 篩選、JSON 表格、資金流圖表、圖片轉換、密碼與金鑰、網頁檢查' },
      { label: '費用', value: '免費，沒有廣告' },
      { label: '技術', value: '純前端 HTML／JavaScript，部署在 Cloudflare Workers' },
      { label: '開發', value: 'LazyRhythm' }
    ],
    sections: [
      {
        id: 'what',
        heading: '這是什麼',
        paragraphs: [
          'LazyEmbed 是 LazyRhythm 開發的瀏覽器工具集，放的是寫程式時常常臨時需要的小工具：把 JSON 轉成 YAML、從 API 回應產生型別、把截圖壓成 WebP、產生一組 JWT Secret、查一個網域的 DNS',
          '每個工具都是一個獨立的網頁，打開就能用，不用安裝、不用登入。貼上資料或拖進檔案，結果直接出現在旁邊，可以複製或下載'
        ]
      },
      {
        id: 'problem',
        heading: '以前要怎麼做',
        paragraphs: [
          '這類小事通常要分別找不同的線上工具，每個網站的介面、廣告與資料去向都不一樣；要不就是為了轉一次格式，在專案裡臨時寫一段腳本',
          'LazyEmbed 把這些常用的轉換放在同一個地方、同一套介面裡，運算在你的瀏覽器裡完成，貼上的 JSON 與拖進來的圖片不會送到伺服器'
        ]
      },
      {
        id: 'convert',
        heading: '萬用格式轉換器',
        paragraphs: [
          'JSON、YAML、TOML、CSV 四種格式任意互轉，內建 JSON 美化、壓縮與驗證。目標選 TypeScript Interface 或 C# Class，就會依資料結構產生巢狀的型別，C# 版本帶有 System.Text.Json 的 JsonPropertyName 標註'
        ],
        items: [
          { title: '貼上或載入範例', text: '來源可以直接貼上，也可以先載入範例看效果；來源與目標格式可以一鍵對調' },
          { title: '選擇目標', text: 'JSON、YAML、TOML、CSV、TypeScript Interface、C# Class' },
          { title: '複製或下載', text: '輸出區顯示行數，可以複製或存成檔案' }
        ],
        ordered: true,
        image: { file: `${dir}/%E5%8A%9F%E8%83%BD%20%C2%B7%20%E8%90%AC%E7%94%A8%E6%A0%BC%E5%BC%8F%E8%BD%89%E6%8F%9B%E5%99%A8%401x.png`, width: 1600, height: 1200, alt: '萬用格式轉換器畫面：左邊是訂單 JSON，右邊即時產生 Customer、Item、Order、Root 四個 TypeScript interface，下方是同一份資料轉出的 C# class' }
      },
      {
        id: 'filter',
        heading: 'JSON Filter',
        paragraphs: [
          '面對欄位很多的 API 回應，只想看其中幾個欄位時用得上。貼入 JSON 後，左側列出每個屬性與出現次數；勾選想保留的屬性，右邊即時輸出只留下這些欄位的結構，巢狀的父層會自動帶入',
          '把屬性「釘選」（PIN）會出現值分析：列出這個屬性的所有值與筆數，點值就跳到輸出中的那一行，用左右箭頭在多筆之間切換'
        ],
        image: { file: `${dir}/%E5%8A%9F%E8%83%BD%20%C2%B7%20JSON%20Filter%401x.png`, width: 1600, height: 1200, alt: 'JSON Filter 畫面：左側勾選 id、status、total 三個屬性，右邊輸出只剩這三個欄位的訂單 JSON，下方值分析列出 status 的 paid 與 shipped' }
      },
      {
        id: 'image',
        heading: '圖片轉換器',
        paragraphs: [
          '拖曳、選擇或直接貼上（Ctrl／⌘ + V）圖片，支援 PNG、JPEG、WebP、GIF、BMP。可以拖曳裁切、限制最大寬高（保持比例），調整品質後轉成 WebP、AVIF、JPEG 或 PNG',
          '一次可以處理多張，每張都會並排顯示轉換前後的尺寸與檔案大小；可以只下載目前這張，或依目前設定逐張下載全部。圖片在瀏覽器裡處理，不會上傳'
        ],
        image: { file: `${dir}/%E5%8A%9F%E8%83%BD%20%C2%B7%20%E5%9C%96%E7%89%87%E8%BD%89%E6%8F%9B%E5%99%A8%401x.png`, width: 1600, height: 1200, alt: '圖片轉換器畫面：圖片上有裁切框，右側選擇 WebP、品質 80%、最大寬度 1920，輸出結果顯示原始與輸出的尺寸、檔案大小與節省比例' }
      },
      {
        id: 'tools',
        heading: '全部工具',
        items: [
          { title: '萬用格式轉換器', text: 'JSON ↔ YAML ↔ TOML ↔ CSV 互轉，美化、壓縮、驗證，產生 TypeScript Interface 或 C# Class' },
          { title: 'JSON Filter', text: '勾選屬性篩選 JSON，值分析與跳轉導航' },
          { title: 'JSON Table Visualizer', text: '把 JSON 陣列轉成可排序、可搜尋的表格，巢狀物件可以點進去瀏覽' },
          { title: '資金流可視化', text: '輸入收入與費用項目，產生收支圖表與摘要' },
          { title: '圖片轉換器', text: '裁切、限制尺寸、壓縮，轉成 WebP、AVIF、JPEG 或 PNG，支援批次' },
          { title: '密碼與金鑰產生器', text: '用瀏覽器的 crypto.getRandomValues 產生 4 到 128 字元的密碼並顯示強度，也能產生 UUID v4、Hex、Base64 與 Base64URL 金鑰' },
          { title: '網頁檢查工具', text: '用 DNS-over-HTTPS 查 A、AAAA、CNAME、MX、NS、TXT、SOA、CAA 紀錄；貼上 HTML 解析 title、description、Open Graph 與 Twitter Card，並預覽分享卡片' }
        ]
      },
      {
        id: 'privacy',
        heading: '隱私與網路使用',
        paragraphs: [
          '不需要帳號，網站沒有登入、沒有廣告，也沒有內建分析追蹤。工具的運算在你的瀏覽器裡完成，貼上的文字與拖進來的圖片不會上傳到 LazyEmbed 的伺服器'
        ],
        items: [
          { title: 'DNS 查詢', text: '網頁檢查工具查 DNS 時，會把你輸入的網域送到 Cloudflare（cloudflare-dns.com）或 Google（dns.google）的 DNS-over-HTTPS 服務' },
          { title: '直接抓取網頁', text: '按「嘗試直接抓取」時，你的瀏覽器會直接向該網站發出請求；多數網站會因 CORS 擋下，這時改貼 HTML 原始碼解析' },
          { title: '從 CDN 載入的函式庫', text: '格式轉換器第一次處理 YAML 或 TOML 時會從 esm.sh 載入解析器，資金流可視化從 jsDelivr 載入 Chart.js；載入的是程式碼，你的資料不會送過去' },
          { title: '資金流的嵌入連結', text: '「複製嵌入連結」會把輸入的項目與金額放進網址參數；分享這個連結，就等於分享這些數字' }
        ]
      },
      {
        id: 'limits',
        heading: '限制與不適用的情況',
        items: [
          { text: '介面只有繁體中文' },
          { text: 'AVIF 需要瀏覽器支援編碼，不支援時 AVIF 按鈕會停用' },
          { text: '多數網站無法被前端直接抓取（CORS），Meta 與社群預覽通常要手動貼上 HTML 原始碼' },
          { text: 'YAML、TOML 解析與資金流圖表需要能連到對應的 CDN；離線時這幾項無法使用' },
          { text: '型別產生依範例資料推斷：陣列裡同名物件的欄位不完全一致時，可能產生多個相似的型別（例如 Customer 與 Customer2），需要手動合併' },
          { text: '工具都在瀏覽器記憶體裡處理，非常大的 JSON 或大量高解析度圖片會變慢' },
          { text: '首頁的時鐘、計數器、天氣是示範用的範例小工具，不是正式功能' }
        ]
      }
    ],
    faq: [
      {
        question: 'LazyEmbed 是什麼？',
        answer: 'LazyEmbed 是一組在瀏覽器裡執行的開發者小工具，包含格式轉換、JSON 篩選與表格、圖片轉換、密碼與金鑰產生、DNS 與 Open Graph 檢查等，打開網頁就能用'
      },
      {
        question: '需要註冊或安裝嗎？要付費嗎？',
        answer: '不需要。沒有帳號、不用安裝，免費使用，也沒有廣告'
      },
      {
        question: '我貼上的資料會被上傳嗎？',
        answer: '不會上傳到 LazyEmbed 的伺服器，運算在你的瀏覽器裡完成。例外是網頁檢查工具：查 DNS 時網域會送到 Cloudflare 或 Google 的 DNS-over-HTTPS，「嘗試直接抓取」會由你的瀏覽器直接連到該網站'
      },
      {
        question: '可以從 JSON 產生哪些型別？',
        answer: '萬用格式轉換器可以產生 TypeScript Interface 與 C# Class（帶 System.Text.Json 的 JsonPropertyName 標註），巢狀物件與陣列會拆成獨立的型別'
      },
      {
        question: '圖片轉換器支援哪些格式？',
        answer: '可以讀 PNG、JPEG、WebP、GIF、BMP，輸出 WebP、AVIF、JPEG 或 PNG。AVIF 要看瀏覽器是否支援編碼。可以裁切、限制最大尺寸、調整品質，一次處理多張'
      },
      {
        question: '密碼產生器安全嗎？',
        answer: '密碼與金鑰由瀏覽器的 crypto.getRandomValues 產生，在你的裝置上完成，不經過任何伺服器'
      },
      {
        question: '什麼情況不適合使用？',
        answer: '需要離線處理 YAML、TOML 或圖表、要處理非常大的檔案，或需要英文介面時都不適合。要抓取其他網站的 Meta 標籤時，多半得自己貼上 HTML 原始碼'
      }
    ],
    // repo 沒有 LICENSE，不連 GitHub；只放正式站。
    links: [
      { label: '開啟 LazyEmbed', url: 'https://embed.lazyrhythm.com', note: '免安裝、免登入' }
    ],
    sourceNote: '內容依正式站與各工具的原始碼整理'
  }]
};
