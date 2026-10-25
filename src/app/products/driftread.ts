import { Product } from './product.model';

// Author-provided website images are loaded directly from pCloud.
const dir = 'https://filedn.eu/lyWyjTiBuD9uWONu3Or0JNX/lazyrhythm/Driftread/website';

/**
 * 內容取自 dwvwdv/driftread 的 README、docs/FEATURES.md（推薦邏輯、限制與門檻）、
 * frontend/src/app/components（feed-list、recommendations、discover、search、article-reader、login）、
 * frontend/src/app/services/recommendation.ts 與 backend/routers/recommendations.py。
 * 目前不開放註冊（登入頁的說明）：頁面只主打不用登入就能用的功能，訂閱、閱讀流、每日閱讀、收藏、
 * 離線閱讀等帳號功能不寫成一般訪客可用。repo 沒有授權條款：不寫「開源」，也不放 GitHub 與自架。
 * 產品功能或開放狀態有變動時，同步更新這裡與 `updated`。
 */
export const DRIFTREAD: Product = {
  slug: 'driftread',
  updated: '2026-10-25',
  applicationCategory: 'ReferenceApplication',
  operatingSystem: 'Web',
  free: true,
  articleTag: 'Driftread',
  versions: [{
    lang: 'zh-TW',
    name: '漂流閱讀',
    alternateName: 'Driftread',
    title: '漂流閱讀 Driftread：RSS 信息源推薦與閱讀平台',
    description: '漂流閱讀（Driftread）是 RSS 信息源推薦與閱讀平台：從你喜歡的來源推薦還沒訂閱過的 RSS 源，貼上任何網址就能找出它的 RSS / Atom feed，文章全文快取在站內，可以全文搜尋、直接閱讀。',
    eyebrow: 'Web · RSS · 推薦與閱讀',
    tagline: '從你喜歡的來源出發，挖出還沒遇過、但可能會喜歡的 RSS 信息源。',
    hero: { file: `${dir}/Hero%202400%C3%971200%401x.png`, width: 2400, height: 1200, alt: '漂流閱讀的「猜你喜歡」頁面：一張信息源卡片附上推薦理由「因為你喜歡過「開源、資料庫」相關的來源」，旁邊是已喜歡的來源、從網址發現 RSS 的結果與信息源卡片' },
    og: { file: `${dir}/OG%20%E5%88%86%E4%BA%AB%E5%9C%96%201200%C3%97630%401x.png`, width: 1200, height: 630, alt: '漂流閱讀 Driftread：挖出你還沒遇過但可能會喜歡的 RSS 信息源' },
    facts: [
      { label: '平台', value: '網頁，桌面與手機瀏覽器都能用' },
      { label: '帳號', value: '瀏覽、猜你喜歡、發現 RSS 與搜尋都不用登入；目前不開放註冊' },
      { label: '費用', value: '免費使用' },
      { label: '技術', value: 'Angular、Python（FastAPI）、Supabase（PostgreSQL）' },
      { label: '開發', value: 'LazyRhythm' }
    ],
    sections: [
      {
        id: 'what',
        heading: '這是什麼',
        paragraphs: [
          '漂流閱讀（英文名稱 Driftread）是 LazyRhythm 開發的 RSS 推薦與閱讀網站。它收錄了一批持續更新的 RSS 信息源，可以依分類、語言與標籤瀏覽，也會依你喜歡過的來源，一張一張推薦你還沒遇過的信息源。',
          '文章全文快取在站內，點開就能讀，也能用關鍵字全文搜尋；遇到想追的網站，貼上網址就能找出它提供的 RSS / Atom feed。'
        ]
      },
      {
        id: 'problem',
        heading: '以前做不到的事',
        paragraphs: [
          'RSS 閱讀器擅長的是「追蹤你已經知道的網站」：你得先知道某個部落格存在、找到它的 feed 網址，才能訂閱。真正難的是找到下一個值得讀的來源。',
          '漂流閱讀把方向反過來：從你喜歡過的信息源出發，依它們的分類與標籤推薦還沒遇過的來源，並寫出推薦理由，讓你知道為什麼會看到這一個。'
        ]
      },
      {
        id: 'how',
        heading: '猜你喜歡怎麼運作',
        ordered: true,
        items: [
          { title: '一次一張卡片', text: '「猜你喜歡」一次只給一個信息源，卡片上有分類、語言、標籤、篇數與推薦理由，例如「因為你喜歡過「開源、資料庫」相關的來源」。' },
          { title: '喜歡、跳過或看詳細', text: '按「喜歡」記下這個來源，按「跳過」換下一張，「看詳細」可以先看這個來源最近的文章再決定。' },
          { title: '下一批依喜好排序', text: '喜歡過的來源所屬的分類、標籤與語言會加權，下一批推薦從這些線索往外找；喜歡過的來源不會再推，跳過的來源暫時不再出現。' },
          { title: '保留一點意外', text: '推薦裡也會混入少量不同類別的來源，卡片會標明是「小比例探索」，避免越推越窄。' }
        ],
        note: '不登入時，喜歡與跳過的紀錄存在你自己的瀏覽器裡，換一台裝置或清除網站資料就會重新開始。',
        image: { file: `${dir}/%E5%8A%9F%E8%83%BD%20%C2%B7%20%E7%8C%9C%E4%BD%A0%E5%96%9C%E6%AD%A1%401x.png`, width: 1600, height: 1200, alt: '猜你喜歡的流程：喜歡、跳過、下一批依喜好排序；推薦卡片附上推薦理由，下一批出現標示「小比例探索」的不同類別來源' }
      },
      {
        id: 'discover',
        heading: '從網址發現 RSS',
        paragraphs: [
          '不確定一個網站有沒有 RSS？在「發現」頁貼上它的首頁、部落格或任一篇文章的網址，漂流閱讀會去探測，列出可用的 RSS / Atom feed 與網址。已經收錄的來源可以直接點進去看文章。'
        ],
        image: { file: `${dir}/%E5%8A%9F%E8%83%BD%20%C2%B7%20%E5%BE%9E%E7%B6%B2%E5%9D%80%E7%99%BC%E7%8F%BE%20RSS%401x.png`, width: 1600, height: 1200, alt: '發現頁：貼上一個網站的文章網址，找到兩個 RSS / Atom feed，皆已收錄並可前往查看' }
      },
      {
        id: 'read',
        heading: '搜尋與全文閱讀',
        paragraphs: [
          '收錄來源的文章會定期抓取，全文快取在站內：點開文章就在漂流閱讀裡讀，版面乾淨，原文連結也一直都在。',
          '搜尋頁分成文章與來源兩個分頁：文章比對標題、摘要、作者與內文，來源比對名稱與描述，也可以依語言篩選。'
        ],
        image: { file: `${dir}/%E5%8A%9F%E8%83%BD%20%C2%B7%20%E6%90%9C%E5%B0%8B%E8%88%87%E5%85%A8%E6%96%87%E9%96%B1%E8%AE%80%401x.png`, width: 1600, height: 1200, alt: '搜尋頁以關鍵字「長期」找到多篇文章與摘要，旁邊是站內的文章閱讀頁與「前往原文閱讀」按鈕' }
      },
      {
        id: 'features',
        heading: '核心功能',
        items: [
          { title: '信息源目錄', text: '依分類、語言與標籤組合篩選，也能用關鍵字找來源；點卡片上的標籤直接篩選。' },
          { title: '猜你喜歡', text: '依喜歡過的分類、標籤與語言推薦還沒遇過的來源，每張卡片附推薦理由。' },
          { title: '從網址發現 RSS', text: '貼上任何網站、部落格或文章網址，找出可用的 RSS / Atom feed。' },
          { title: '全文搜尋', text: '文章與來源分開搜尋，依相關度排序，結果附命中的摘要片段。' },
          { title: '站內閱讀', text: '文章全文快取在站內，隨時可以前往原文。' },
          { title: '自動更新', text: '收錄的來源會依實際更新頻率自動調整抓取間隔，長期抓取失敗的來源會自動封存。' },
          { title: '三種主題', text: '淺色、深色與跟隨系統，選擇會記在瀏覽器裡。' }
        ]
      },
      {
        id: 'privacy',
        heading: '隱私與資料',
        paragraphs: [
          '不登入就能使用公開功能，不需要提供 email 或任何個人資料。'
        ],
        items: [
          { title: '存在你瀏覽器裡的東西', text: '未登入時的喜歡、不喜歡與跳過紀錄，以及主題設定，存在瀏覽器的本機儲存；推薦時會把這幾份清單隨請求送出，用來排序與排除。' },
          { title: '請求頻率限制', text: '推薦、發現與搜尋有以 IP 計算的頻率限制（每個端點每分鐘 20 次），太頻繁時會請你稍候再試。' },
          { title: '發現 RSS 會代你連線', text: '在發現頁貼上的網址，會由伺服器代為連線探測 feed。' }
        ],
        note: '網站沒有內建廣告或第三方分析 SDK。'
      },
      {
        id: 'limits',
        heading: '限制與不適用的情況',
        items: [
          { text: '目前不開放註冊：訂閱、個人閱讀流、每日閱讀、收藏與離線閱讀這些帳號功能，一般訪客還無法使用。' },
          { text: '推薦與目錄只涵蓋站內收錄的信息源；發現頁能找出其他網站的 feed，但不會因此自動收錄。' },
          { text: '較舊的文章完整正文可能依保存期限移除，仍可前往原文閱讀；每個來源保留的文章數也有上限。' },
          { text: '只處理 RSS / Atom：沒有 feed 的網站、需要登入或付費才能看的內容無法收錄。' },
          { text: '介面目前只有繁體中文。' }
        ]
      }
    ],
    faq: [
      {
        question: '漂流閱讀是什麼？',
        answer: '漂流閱讀（Driftread）是 RSS 信息源推薦與閱讀網站：瀏覽收錄的信息源、讓「猜你喜歡」推薦還沒遇過的來源、從網址找出 RSS feed，並在站內全文搜尋與閱讀文章。'
      },
      {
        question: '它讓什麼變得可能？',
        answer: '讓你不必先知道一個網站存在，也能找到值得訂閱的 RSS 來源。漂流閱讀從你喜歡過的信息源出發，推薦分類與標籤相近、但還沒遇過的來源，並寫出推薦理由。'
      },
      {
        question: '需要註冊帳號嗎？',
        answer: '不用。瀏覽信息源、猜你喜歡、從網址發現 RSS、搜尋與閱讀文章都不需要登入。目前也不開放註冊，帳號才有的訂閱與個人閱讀流等功能暫時無法申請。'
      },
      {
        question: '「猜你喜歡」是怎麼推薦的？',
        answer: '依你喜歡過的來源所屬的分類、標籤與語言加權排序，排除已喜歡的來源並暫時略過跳過的來源，並混入少量不同類別的來源作為探索。每張卡片會寫出推薦理由。'
      },
      {
        question: '可以把找到的 feed 放進其他 RSS 閱讀器嗎？',
        answer: '可以。發現頁會列出每個 feed 的網址，複製到任何支援 RSS / Atom 的閱讀器就能訂閱。'
      },
      {
        question: '會收集哪些資料？',
        answer: '不登入時不需要任何個人資料。喜歡、跳過紀錄與主題設定存在你的瀏覽器裡；推薦、發現與搜尋會以 IP 做頻率限制。網站沒有內建廣告或第三方分析 SDK。'
      },
      {
        question: '什麼情況不適合使用？',
        answer: '需要完整的個人訂閱與已讀管理（目前不開放註冊）、想追蹤沒有 RSS 的網站，或主要讀需要登入／付費的內容時，都不適合。'
      }
    ],
    links: [
      { label: '前往漂流閱讀', url: 'https://driftread.lazyrhythm.com', note: '網頁版，免登入即可瀏覽' }
    ],
    sourceNote: '內容依網站的實作與開發文件整理'
  }]
};
