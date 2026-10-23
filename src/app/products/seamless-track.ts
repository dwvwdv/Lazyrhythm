import { Product } from './product.model';

// Author-provided website images are loaded directly from pCloud.
const dir = 'https://filedn.eu/lyWyjTiBuD9uWONu3Or0JNX/lazyrhythm/SeamlessTrack/website';

/**
 * 內容取自 dwvwdv/seamless_track 的 README、AGENTS.md 與 docs/（overview、auto-accounting、investment、
 * scheduled-tasks、statistics、data-management、transfers-and-mirrors）及 assets/preset_apps.json。
 * 隱私段落依該 repo AGENTS.md「隱私與網路說明」的措辭：不可寫成「完全不連網」或「通知永不離開裝置」。
 * App 功能或隱私說明有變動時，同步更新這裡與 `updated`。
 */
export const SEAMLESS_TRACK: Product = {
  slug: 'seamless-track',
  updated: '2026-10-23',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Android 7.0+',
  installUrl: 'https://play.google.com/store/apps/details?id=com.lazyrhythm.seamless_track',
  free: true,
  articleTag: 'Seamless Track',
  versions: [{
    lang: 'zh-TW',
    name: '無感記帳',
    alternateName: 'Seamless Track',
    title: '無感記帳 Seamless Track：Android 通知自動記帳 App',
    description: '無感記帳（Seamless Track）是本地優先的 Android 記帳 App：讀取銀行與支付 App 的交易通知，由原生層規則引擎自動建立交易，App 沒開也能記帳。帳務資料存在裝置本地、預設不上傳。',
    eyebrow: 'Android · 自動記帳 · 本地優先',
    tagline: '把銀行與支付 App 的交易通知，自動變成帳目的 Android 記帳 App。',
    hero: { file: `${dir}/Hero%202400%C3%971200%401x.png`, width: 2400, height: 1200, alt: '無感記帳 App 畫面：銀行通知自動轉成交易紀錄，首頁顯示帳戶與淨資產' },
    og: { file: `${dir}/OG%20%E5%88%86%E4%BA%AB%E5%9C%96%201200%C3%97630%401x.png`, width: 1200, height: 630, alt: '無感記帳 Seamless Track：Android 通知自動記帳' },
    facts: [
      { label: '平台', value: 'Android 7.0（API 24）以上' },
      { label: '必要權限', value: '通知存取（自動記帳用）' },
      { label: '資料儲存', value: '裝置本地 SQLite，預設不上傳' },
      { label: '費用', value: '免費下載；含廣告，可訂閱去廣告（月／年方案）' },
      { label: '技術', value: 'Flutter、Kotlin、SQLite' },
      { label: '開發', value: 'LazyRhythm' }
    ],
    sections: [
      {
        id: 'what',
        heading: '這是什麼',
        paragraphs: [
          '無感記帳（英文名稱 Seamless Track）是 LazyRhythm 開發的 Android 記帳 App。你授權「通知存取」之後，它會讀取銀行、信用卡與支付 App 發出的交易通知，依規則擷取金額，直接建立交易並更新帳戶餘額。',
          '記帳的判斷在 Android 原生層（Kotlin）完成，App 沒有開著也會照常記帳。帳戶、交易與通知都存在手機本地的 SQLite 資料庫，預設不上傳。'
        ]
      },
      {
        id: 'problem',
        heading: '解決什麼問題',
        paragraphs: [
          '手動記帳最常失敗在「忘記記」：一天好幾筆刷卡、轉帳與扣款，事後很難補齊，記到一半就放棄。',
          '這些交易其實大多已經出現在銀行或支付 App 的推播通知裡。無感記帳把通知當成記帳來源，讓日常記帳從逐筆輸入，變成偶爾確認與修正；通知涵蓋不到的固定收支（房租、訂閱、保費、折舊）則交給定期排程補上。'
        ]
      },
      {
        id: 'how',
        heading: '自動記帳怎麼運作',
        ordered: true,
        items: [
          { title: '授權與選擇 App', text: '在系統設定為無感記帳開啟「通知存取權限」，再選擇要監測的 App；常用銀行與支付 App 可以直接套用預配置規則，並把不同類型的通知綁到不同帳戶（例如台幣與外幣、銀行與信用卡）。' },
          { title: '接收通知', text: 'Android 的通知監聽服務收到監測中 App 的通知後，先寫入本地通知紀錄；同一則通知在 5 秒內重複推播時會被過濾。' },
          { title: '規則比對與擷取', text: '原生層的規則引擎依該 App 的規則比對條件（包含文字、正則等），擷取金額、收支類型與分類。一般規則命中第一條就停止；標記為「附加規則」的規則可讓同一則通知多記一筆，例如信用卡繳費同時是信用卡入帳與銀行扣款。' },
          { title: '建立交易', text: '命中後直接在原生層寫入交易並更新帳戶餘額，接著嘗試轉帳配對與鏡像帳戶關聯。整個流程不需要打開 App。' },
          { title: '確認與修正', text: '可以開啟記帳確認通知（30 秒後自動消失，預設關閉）。通知紀錄頁會顯示每則通知是否已記帳；改完規則後，可用「重新檢查通知」把先前沒記到的通知補記。' }
        ],
        note: '例外：投資買賣規則在原生層只暫存擷取結果，交易會在下次開啟 App 時建立。',
        image: { file: `${dir}/%E5%8A%9F%E8%83%BD%20%C2%B7%20%E8%87%AA%E5%8B%95%E8%A8%98%E5%B8%B3%E6%B5%81%E7%A8%8B%401x.png`, width: 1600, height: 1200, alt: '自動記帳流程圖：銀行通知經過原生層規則引擎比對後建立交易並更新帳戶餘額' }
      },
      {
        id: 'rules',
        heading: '規則編輯',
        paragraphs: [
          '每個 App 都可以自訂比對條件與欄位擷取器（支援正則），決定哪些通知要記、金額與標題從哪裡取、記到哪個帳戶。',
          '規則編輯頁的預覽直接呼叫負責背景記帳的同一個原生規則引擎，顯示這則通知會不會被記、會記成什麼，以及沒有記帳的原因（例如沒有匹配、正則錯誤、擷取不到金額）。預覽和背景記帳用的是同一份判斷，不會各說各話。'
        ],
        image: { file: `${dir}/%E5%8A%9F%E8%83%BD%20%C2%B7%20%E8%A6%8F%E5%89%87%E7%B7%A8%E8%BC%AF%401x.png`, width: 1600, height: 1200, alt: '無感記帳規則編輯畫面：點選通知中的金額設定擷取，套用預配置規則，並即時預覽記帳結果' }
      },
      {
        id: 'features',
        heading: '核心功能',
        items: [
          { title: '自動記帳', text: '從金融相關 App 的通知擷取金額並建立交易，背景由 Android 原生層處理，App 未開啟時也能運作。' },
          { title: '多帳戶與多幣種', text: '內建現金、銀行帳戶、信用卡、股票帳戶、鏡像帳戶等類型，也能自訂帳戶類型（資產或負債、圖示、底色）；內建 TWD、USD、CNY、JPY、EUR，並可自訂幣種與小數位數。' },
          { title: '轉帳自動配對', text: '一筆支出與一筆收入在時間窗內金額相抵（跨幣種依匯率換算）才視為帳戶間轉帳，配對後不計入收支統計；時間窗與跨幣種容差可以調整，也能手動確認或解除。' },
          { title: '投資帳戶', text: '股票帳戶與選配的加密貨幣帳戶，餘額是「帳戶內現金＋持倉價值」而不是收支加總，持股以移動平均成本法彙總。' },
          { title: '定期排程', text: '通知涵蓋不到的定期資金流動：固定金額、只登記不記帳的「純紀錄」（例如已由通知記帳的訂閱）、餘額百分比攤提、餘額重置與定期投資買賣。到期後開啟 App 時逐期補記，並留下執行紀錄。' },
          { title: '統計分析', text: '資產、收支、分類、投資、趨勢五個分頁的圖表，版面可自訂；另有日曆檢視與桌面月曆小工具。' },
          { title: '資料管理', text: '資料庫可加密匯出（AES-256-GCM 的 .stbak 檔）並從檔案還原，也可選擇啟用 Google Drive 自動備份。' },
          { title: '其他', text: '4 位數 PIN 應用鎖、6 種主題；分類功能可整體關閉。' }
        ]
      },
      {
        id: 'insight',
        heading: '淨資產與趨勢',
        paragraphs: [
          '每天 23:59 會凍結一筆淨資產快照（含各幣種明細與匯率）；手機沒在那個時間拍到時，下次開啟 App 會從交易回推補上。統計分析頁用這些快照畫出淨資產走勢。',
          '投資分頁列出各標的的配置占比與損益；「標的價格走勢」以漲跌百分比比較多檔標的。價格走勢只能從安裝之後開始累積，不會回補安裝前的歷史。'
        ],
        image: { file: `${dir}/%E5%8A%9F%E8%83%BD%20%C2%B7%20%E6%B7%A8%E8%B3%87%E7%94%A2%E8%88%87%E8%B6%A8%E5%8B%A2%401x.png`, width: 1600, height: 1200, alt: '無感記帳首頁與統計分析畫面：帳戶資產與負債、淨資產歷史走勢及收支趨勢' }
      },
      {
        id: 'presets',
        heading: '預配置規則支援的 App',
        paragraphs: ['以下 App 有內建的預配置規則，套用後綁定帳戶即可開始自動記帳：'],
        items: [
          { title: 'LINE', text: 'LINE Pay 付款通知（中英文消費通知）' },
          { title: '星展 Card+', text: '信用卡消費與信用卡繳費' },
          { title: '星展 digibank', text: '台幣入帳' },
          { title: '中國信託', text: '轉帳、繳費、信用卡消費與還款入帳' },
          { title: '國泰世華', text: '台幣與外幣的出入帳' },
          { title: '玉山銀行', text: '帳戶交易與信用卡消費' },
          { title: '永豐大咖', text: '台幣刷卡消費' },
          { title: '永豐大戶', text: '台幣入帳與即時轉出' },
          { title: 'Gmail', text: '中國信託、國泰世華的銀行郵件通知（與銀行 App 擇一使用）' }
        ],
        note: '不在清單上的 App 可以自行建立規則。預配置規則以實際收到的通知格式為準，銀行調整通知文字時規則可能需要更新；遇到漏記或記錯，可以從通知紀錄頁回報那幾則通知，協助擴充或修正規則。'
      },
      {
        id: 'privacy',
        heading: '隱私與網路使用',
        paragraphs: [
          '帳務資料完全本地、預設不上傳：帳戶、交易與通知都儲存在裝置本地的 SQLite 資料庫。只有以下兩條例外，而且都必須由你主動啟用或送出。'
        ],
        items: [
          { title: 'Google Drive 雲端備份（預設關閉）', text: '雲端備份為用戶主動啟用、內容加密、上傳至用戶自己的 Google Drive：備份檔以 AES-256 加密，未啟用就完全不上傳。' },
          { title: '通知回報（只在你送出時發生）', text: '在「通知紀錄 → 回報記帳問題」逐筆勾選並確認後，只有勾選的那幾則通知原文，加上 App 版本、語系與「漏記／記錯」標記，會傳送給開發者，用來擴充或修正預配置規則。沒有背景或自動觸發；送出前會整頁顯示將傳送的完整內容並須勾選同意，數字也可以逐一遮蔽。不含帳戶、交易、金額統計或身分資料。' },
          { title: '匯率自動更新（選配，預設關閉）', text: '定期下載公開匯率，只下載不上傳。法幣匯率表的請求不帶參數；加密貨幣行情的請求會帶上要查詢的幣種代號，但不含持有量、成本、金額或身分資料。' },
          { title: '股價自動更新（選配，預設關閉）', text: '定期下載持股標的的公開行情，只下載不上傳。請求會包含你持有的股票代號，以及定期買賣排程或通知規則要以當下市價計價的代號；不含股數、成本、金額或身分資料。沒有持股也沒有這類設定時完全不連線。' }
        ],
        note: '使用網路的選配擴充在啟用前都會先顯示網路使用同意說明。App 宣告 INTERNET 權限，用於 Google Mobile Ads 廣告（可訂閱去廣告移除）、應用內購買（去廣告訂閱）、應用內更新與評分提示，以及上述由你主動啟用或送出的雲端備份、通知回報與匯率、股價自動更新。手機上的資料庫是一般 SQLite 檔案（未加密），匯出的備份檔則是加密格式；Android 系統自動備份已關閉。'
      },
      {
        id: 'limits',
        heading: '限制與不適用的情況',
        items: [
          { text: '只支援 Android 7.0（API 24）以上，目前沒有 iOS 版本。' },
          { text: '自動記帳需要授予通知存取權限；不授權的話只能手動記帳。' },
          { text: '依賴銀行或支付 App 發出含金額的通知：關閉推播、通知不含金額，或使用不發通知的付款方式（例如現金）時，無法自動記帳，需要手動補記或用定期排程。' },
          { text: '預配置規則目前涵蓋上面列出的 9 個 App，其他 App 需要自己設定規則。' },
          { text: '同一筆交易若同時有銀行 App 通知與 Gmail 郵件通知，App 不會自動去除重複，需擇一來源記帳。' },
          { text: '資料只在一台手機上。Google Drive 備份是定期上傳加密備份檔、用於還原，不是多裝置即時同步，也不支援多人共用帳本。' },
          { text: '預算管理與 CSV／Excel 匯出尚未提供（列在開發計畫中）。' }
        ]
      }
    ],
    faq: [
      {
        question: '無感記帳是什麼？',
        answer: '無感記帳（Seamless Track）是一款 Android 記帳 App，會讀取銀行、信用卡與支付 App 的交易通知，自動擷取金額並建立交易紀錄。帳務資料存在手機本地，預設不上傳。'
      },
      {
        question: '它解決什麼問題？',
        answer: '它解決「記帳常常忘記記、事後補不齊」的問題。大部分交易本來就會出現在銀行或支付 App 的通知裡，無感記帳直接把這些通知轉成帳目，你只需要偶爾確認與修正。'
      },
      {
        question: '自動記帳怎麼運作？App 沒開也會記嗎？',
        answer: '會。通知由 Android 的通知監聽服務接收，原生層（Kotlin）的規則引擎依規則比對、擷取金額，直接寫入交易並更新餘額，整個過程不需要打開 App。投資買賣規則是例外，會在下次開啟 App 時才建立交易。'
      },
      {
        question: '我的帳務資料會被上傳嗎？',
        answer: '帳務資料完全本地、預設不上傳。例外只有兩個，都要你主動操作：啟用 Google Drive 雲端備份時，加密備份會上傳到你自己的 Drive；在通知紀錄頁逐筆勾選並送出「回報記帳問題」時，只有勾選的通知原文會傳給開發者。另外，選配的匯率與股價自動更新會在請求中帶上要查詢的幣種或股票代號。'
      },
      {
        question: '支援哪些銀行或 App？',
        answer: '預配置規則支援 LINE（LINE Pay）、星展 Card+、星展 digibank、中國信託、國泰世華、玉山銀行、永豐大咖、永豐大戶與 Gmail 的銀行郵件通知。其他會發出交易通知的 App 可以自行設定比對條件與金額擷取規則。'
      },
      {
        question: '什麼情況不適合使用？',
        answer: '使用 iPhone、不願意授予通知存取權限、主要用現金或不發通知的付款方式，或需要多裝置即時同步、多人共用帳本的情況，都不適合。無感記帳只支援 Android 7.0 以上，資料存在單一手機上。'
      },
      {
        question: '漏記或記錯了怎麼辦？',
        answer: '通知紀錄頁會標出每則通知是否已記帳。你可以直接編輯或手動補記交易、修改該 App 的規則後用「重新檢查通知」補記，也可以把那幾則通知回報給開發者，協助修正預配置規則。'
      }
    ],
    links: [
      { label: 'Google Play 下載', url: 'https://play.google.com/store/apps/details?id=com.lazyrhythm.seamless_track', note: '套件名稱 com.lazyrhythm.seamless_track' }
    ],
    sourceNote: '內容依 App 的公開說明與開發文件整理'
  }]
};
