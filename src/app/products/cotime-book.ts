import { Product } from './product.model';

// Author-provided website images are loaded directly from pCloud.
const dir = 'https://filedn.eu/lyWyjTiBuD9uWONu3Or0JNX/lazyrhythm/CotimeBook/website';

/**
 * 內容取自 dwvwdv/cotime_book 的 README、CLAUDE.md、changelog（.claude/skills/changelog.md）、
 * supabase/migrations 與 lib/（page_sync_service、page_turn_input、reader_screen、layout_report）。
 * 隱私段落依實際存進 Supabase 的欄位撰寫：App 需要連網，不可寫成「完全本地」或「伺服器不存任何資料」。
 * 廣告依 cotime_book PR #59（v1.0.13，AdMob 插頁式廣告）撰寫，不可寫成「無廣告」。
 * 原始碼不公開，對外只連 Google Play，不連 GitHub。
 * 傳書方式可能改變（評估中的 FilePizza 等），頁面只承諾「不保存使用者的書」，不寫傳輸管道。
 * App 功能或資料欄位有變動時，同步更新這裡與 `updated`。
 */
export const COTIME_BOOK: Product = {
  slug: 'cotime-book',
  updated: '2026-10-27',
  applicationCategory: 'ReferenceApplication',
  operatingSystem: 'Android 7.0+',
  installUrl: 'https://play.google.com/store/apps/details?id=com.lazyrhythm.cotime_book',
  free: true,
  articleTag: 'CoTime Book',
  versions: [{
    lang: 'zh-TW',
    name: '頁間',
    alternateName: 'CoTime Book',
    title: '頁間 CoTime Book：多人遠端共讀的 Android EPUB 閱讀 App',
    description: '頁間（CoTime Book）是多人遠端共讀的 Android EPUB 閱讀 App：建立房間、分享六碼房號，翻頁前全房確認，每個人看到的同一頁排版相同。免註冊，為電子閱讀器設計，也提供 TXT 轉 EPUB 與公版書庫。',
    eyebrow: 'Android · 共讀 · 電子紙優先',
    tagline: '幾個人分隔兩地，讀同一本書的同一頁，一起翻下一頁。',
    hero: { file: `${dir}/Hero%202400%C3%971200%401x.png`, width: 2400, height: 1200, alt: '頁間 App 畫面：房間大廳顯示六碼房號與三位成員，手機與電子閱讀器同時顯示紅樓夢第一回與「小安想翻下一頁」的確認列' },
    og: { file: `${dir}/OG%20%E5%88%86%E4%BA%AB%E5%9C%96%201200%C3%97630%401x.png`, width: 1200, height: 630, alt: '頁間 CoTime Book：多人共讀，同一頁一起翻，手機、電子閱讀器都能用' },
    facts: [
      { label: '平台', value: 'Android 7.0（API 24）以上，手機、平板與 Android 電子閱讀器' },
      { label: '帳號', value: '免註冊：匿名登入，只需要暱稱' },
      { label: '書籍格式', value: 'EPUB（單本 40MB 以內）；TXT 可先用內建工具轉成 EPUB' },
      { label: '網路', value: '需要：開房、翻頁確認與傳書都要連網' },
      { label: '費用', value: '免費下載，含插頁式廣告' },
      { label: '技術', value: 'Flutter、Supabase、epub.js' },
      { label: '開發', value: 'LazyRhythm' }
    ],
    sections: [
      {
        id: 'what',
        heading: '這是什麼',
        paragraphs: [
          '頁間（英文名稱 CoTime Book）是 LazyRhythm 開發的 Android 共讀 App。一個人建立房間、把六碼房號傳給朋友，大家加入同一個房間、拿到同一本 EPUB，就能在各自的手機或電子閱讀器上一起讀。',
          '房間裡的每個人永遠停在同一頁。任何人想翻頁，都要等其他人確認之後才一起翻；不會有人先讀完、在旁邊等，也不會有人默默落後半頁。'
        ]
      },
      {
        id: 'problem',
        heading: '以前做不到的事',
        paragraphs: [
          '電子書一直是一個人讀的東西。兩個人就算拿著同一本書，各自的螢幕、字級與分頁都不一樣，沒辦法確定彼此正看著同一段文字，更沒辦法在同一刻一起翻到下一頁。',
          '頁間把「同一頁」變成整個房間共用的東西：所有人用同一個頁框與字級排版，看到的這一頁內容完全相同；翻頁經過全員確認，整個房間一起翻。人在不同地方，也能像坐在一起看同一本書。'
        ]
      },
      {
        id: 'how',
        heading: '共讀怎麼運作',
        ordered: true,
        items: [
          { title: '開房與加入', text: '輸入暱稱即可開始（匿名登入，不用 email）。建立房間會拿到一組六碼房號，朋友輸入房號加入；最近的房間會記在手機上，曾經在房內的人也能重新開啟已關閉的房間。' },
          { title: '準備同一本書', text: '房裡任何人分享一本 EPUB，或從公共書庫選一本。大廳會列出每位成員是否已經拿到書，全員到齊就能開始閱讀。' },
          { title: '同一頁、同一個排版', text: '每台裝置都用同一個頁框（房內最小的閱讀區域）、同一個內建字型與字級排版，所以每個人看到的這一頁內容完全相同。比頁框大的平板會把整頁放大填滿螢幕，而不是多排幾行字。' },
          { title: '提出翻頁', text: '任何人點畫面、滑動或按翻頁鍵，其他人的畫面頂端就會出現「某某想翻下一頁」。' },
          { title: '確認後一起翻', text: '其他人按「Turn」，或直接按同方向的翻頁鍵，就算同意；按「Wait」會取消這次翻頁。全員同意後整個房間一起翻到同一頁；30 秒內沒有全員同意，這次翻頁就取消。' }
        ],
        note: '有人斷線時（例如裝置休眠），房間會暫停翻頁最多 1 分鐘等他重連，同步列會寫出正在等誰；重連後所有人自動對齊到最新的位置。',
        image: { file: `${dir}/%E5%8A%9F%E8%83%BD%20%C2%B7%20%E5%85%B1%E8%AD%98%E7%BF%BB%E9%A0%81%401x.png`, width: 1600, height: 1200, alt: '頁間共識翻頁流程：小安按下一頁，其他人按 Turn 或同方向的翻頁鍵確認，全員到齊後一起翻到下一頁' }
      },
      {
        id: 'books',
        heading: '書從哪裡來',
        items: [
          { title: '分享自己的 EPUB', text: '從手機裡選一本 EPUB 分享到房間，單本最大 40MB。收書是由收書的人主動要：收到一半斷線也沒關係，會向房裡其他已經有書的人接著要。' },
          { title: 'TXT 轉 EPUB', text: '首頁的「TXT to EPUB」工具支援 UTF-8、UTF-16、GBK 與 Big5，多個分卷檔可以合成一本；轉好後先在自己的裝置上讀過、確認章節與文字正確，存成 EPUB 再拿進房間分享。房間裡只收 EPUB，轉壞的書不會讓整房等。' },
          { title: '公共書庫', text: '收錄古騰堡計畫等公有領域的經典作品，以封面書架呈現，可以用中文或原文書名、作者搜尋，並依多個 tag 與書本語言篩選。從書庫選的書，每個人各自直接下載並以雜湊驗證，不必等別人傳。' }
        ],
        image: { file: `${dir}/%E5%8A%9F%E8%83%BD%20%C2%B7%20%E5%88%86%E4%BA%AB%E6%9B%B8%E8%88%87%E6%9B%B8%E5%BA%AB%401x.png`, width: 1600, height: 1200, alt: '頁間的 TXT to EPUB 轉檔畫面與公共書庫：可依 tag 與語言篩選的封面書架' }
      },
      {
        id: 'features',
        heading: '核心功能',
        items: [
          { title: '共識翻頁', text: '翻頁前全房確認，按同方向的翻頁鍵就是同意；不同意按 Wait。' },
          { title: '全房共用排版', text: '同一個頁框、字型與字級，每個人的同一頁內容一致；中文與插圖頁也能正確對齊。' },
          { title: '房主決定字級', text: '字級預設由房主設定，房主也可以開放大家各自調整（房間仍以最大的字級排版）。' },
          { title: '六碼房號', text: '免註冊、匿名登入，輸入暱稱與房號就能加入；記住最近的房間。' },
          { title: '傳書不會卡死', text: '收書沒有失敗終態，中斷後會換一位有書的成員繼續要，也不會擋住分享新書。' },
          { title: 'TXT to EPUB', text: '自動判斷編碼與章節標題，可以先單機預覽、確認排版與房間相同後再分享。' },
          { title: '公共書庫', text: '公有領域經典，中文書名、原文書名與作者都能搜尋，可複選 tag。' },
          { title: '閱讀設定', text: 'Paper、Sepia、Night 三種閱讀主題與音量鍵翻頁，設定會記住。' }
        ]
      },
      {
        id: 'eink',
        heading: '為電子紙而設計',
        paragraphs: [
          '很多人用 Android 電子閱讀器讀頁間，所以介面先照墨水屏設計：只用黑、白與一種灰，狀態用字重、黑白反轉與文字標籤表達，不靠顏色；換頁與提示都不做動畫、不用半透明與陰影，避免殘影；按鈕夠大，翻頁區沿用電子書閱讀器的習慣（左側三分之一往回，其餘往前）。',
          '電子閱讀器的實體翻頁鍵、藍牙翻頁器與鍵盤的 Page Up／Page Down、方向鍵都能翻頁，也可以開啟音量鍵翻頁。在手機上一樣好用。'
        ],
        image: { file: `${dir}/%E5%8A%9F%E8%83%BD%20%C2%B7%20%E9%9B%BB%E5%AD%90%E7%B4%99%401x.png`, width: 1600, height: 1200, alt: '頁間在電子閱讀器上的畫面：灰階介面、翻頁確認列，以及 Paper、Sepia、Night 三種閱讀主題' }
      },
      {
        id: 'privacy',
        heading: '隱私與網路使用',
        paragraphs: [
          '頁間是連線 App：開房、成員名單、翻頁確認與傳書都需要網路，沒有網路就無法共讀。登入採匿名帳號，不需要 email、手機號碼或密碼。'
        ],
        items: [
          { title: '伺服器上會存什麼', text: '匿名帳號 ID、你輸入的暱稱與頭像顏色、你所在的房間與房號、房間目前這本書的書名與檔案雜湊、房間共同的閱讀位置，以及最後上線時間。房內成員彼此看得到暱稱。' },
          { title: '不保存你的書', text: '分享自己的 EPUB 時，書只會傳給房內的其他成員，存在各自的裝置上；開發者這邊完全不會保存使用者的書。公共書庫的書則由每個人直接從書庫的公開資料夾下載。' },
          { title: '房間會自動清理', text: '30 分鐘沒有回應的成員會被移出房間，沒有人在、或 24 小時沒有任何人上線的房間會關閉，關閉 30 天後刪除；用過的房號不會再發給其他房間。' },
          { title: '排版回報（只在你送出時發生）', text: '閱讀設定的「Page Layout Report」只有在你按下「Send Report」時才會送出，內容是裝置與 App 版本、目前這本書，以及房內各閱讀者的頁框與最近幾次翻頁，用來排查切字或跳頁；不含書的內文、暱稱或帳號 ID。' }
        ],
        note: 'App 透過 Google Mobile Ads（AdMob）顯示插頁式廣告，廣告相關資料由 Google 依其政策處理；除此之外沒有內建第三方分析 SDK。'
      },
      {
        id: 'limits',
        heading: '限制與不適用的情況',
        items: [
          { text: '只支援 Android 7.0（API 24）以上，目前沒有 iOS 版本；介面文字目前是英文。' },
          { text: '只讀 EPUB，單本 40MB 以內；TXT 要先在首頁轉成 EPUB。PDF、MOBI 與受 DRM 保護的電子書無法使用。' },
          { text: '共讀全程需要網路。有人斷線時全房會暫停翻頁，最多等 1 分鐘。' },
          { text: '每次翻頁都要全員同意，為幾個人一起讀的小房間設計；人數越多，等待確認的時間越長。只想各讀各的、各自記錄進度，一般閱讀器會更合適。' },
          { text: '為了讓每個人的同一頁相同，排版取房內最小的頁框與最大的字級：大螢幕不會多顯示文字，字級預設也由房主決定。' },
          { text: '閱讀與 TXT 轉檔存檔時會出現插頁式廣告。看廣告時房裡其他人不用等你，關掉後會跟上房間的頁面；廣告載入失敗時直接略過，不會卡住翻頁或存檔。' },
          { text: '房內成員的 App 版本需要相容，版本太舊的成員會被標示「需要更新 App」。' },
          { text: '分享自己的書之前，請確認你有權與房內的人分享該檔案。' }
        ]
      }
    ],
    faq: [
      {
        question: '頁間是什麼？',
        answer: '頁間（CoTime Book）是一款 Android 共讀 App。建立房間、分享六碼房號，房裡的人讀同一本 EPUB 的同一頁，翻頁前全房確認，再一起翻到下一頁。'
      },
      {
        question: '它讓什麼變得可能？',
        answer: '讓不在同一個地方的人，真的讀同一頁、一起翻頁。以前電子書各自分頁，就算是同一本書，也沒辦法確定彼此看到同一段文字；頁間讓所有人用同一個排版，經過確認後整個房間一起翻到下一頁。'
      },
      {
        question: '翻頁要怎麼確認？一定要按按鈕嗎？',
        answer: '有人提出翻頁時，其他人按 Turn，或直接按同方向的翻頁鍵就算同意，所以在電子閱讀器上用實體翻頁鍵就能確認；按 Wait 會取消這次翻頁。30 秒內沒有全員同意，這次翻頁也會取消。'
      },
      {
        question: '每個人的螢幕大小不同，看到的會是同一頁嗎？',
        answer: '會。所有裝置都用房內最小的頁框、同一個內建字型與最大的字級排版，所以同一頁的內容完全相同。螢幕比頁框大的平板會把整頁放大填滿，而不是多排幾行字。'
      },
      {
        question: '需要註冊帳號嗎？會收集哪些資料？',
        answer: '不需要註冊，App 使用匿名登入。伺服器上存的是匿名帳號 ID、暱稱與頭像顏色、所在房間、房間目前的書名與檔案雜湊、共同的閱讀位置與最後上線時間。分享的書只會傳給房內成員、存在各自的裝置上，開發者這邊完全不會保存使用者的書。App 會顯示 Google AdMob 的插頁式廣告。'
      },
      {
        question: '可以讀哪些書？',
        answer: '可以分享自己手機裡的 EPUB（單本 40MB 以內），也可以從公共書庫選公有領域的經典作品。TXT 小說要先用首頁的「TXT to EPUB」工具轉成 EPUB，確認無誤後再分享。PDF、MOBI 與受 DRM 保護的電子書無法使用。'
      },
      {
        question: '電子閱讀器可以用嗎？',
        answer: '可以，介面就是先照電子紙設計的：灰階、沒有動畫與陰影，實體翻頁鍵、藍牙翻頁器與音量鍵都能翻頁。只要是 Android 7.0 以上、能安裝 App 的電子閱讀器即可。'
      },
      {
        question: '什麼情況不適合使用？',
        answer: '使用 iPhone、沒有穩定網路、主要讀 PDF 或受 DRM 保護的書，或是只想各讀各的、不需要逐頁同步的情況，都不適合。頁間是為幾個人的小房間設計，每次翻頁都要全員確認。'
      }
    ],
    links: [
      { label: 'Google Play 下載', url: 'https://play.google.com/store/apps/details?id=com.lazyrhythm.cotime_book', note: '套件名稱 com.lazyrhythm.cotime_book' }
    ],
    sourceNote: '內容依 App 的實作與開發文件整理'
  }]
};
