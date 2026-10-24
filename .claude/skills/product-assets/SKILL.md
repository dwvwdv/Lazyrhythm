---
name: product-assets
description: >
  LazyRhythm 產品宣傳圖的完整流程：依產品實作生成網站與 Google Play 宣傳圖 → 交給使用者審查 →
  依意見調整直到明確核准 → 推到暫存分支 → 由 pCloud 從暫存分支抓檔上傳 → 驗證後刪除暫存分支。
  當使用者說「做宣傳圖」「產品圖」「Hero / OG / 作品卡封面 / 功能圖」「Play 截圖」「Feature Graphic」
  「把圖傳到 pCloud」「產品頁的圖」，或要替 /products/<slug> 準備圖片時使用。
  不適用：產品頁文字本身（src/app/products/<slug>.ts，走一般 PR）、文章配圖。
---

# Product Assets

產品宣傳圖不進 repo：成品放在 pCloud 公開資料夾，網站與 Google Play 直接引用遠端網址
（見 `docs/prerender.md`）。repo 只在上傳那一刻借一條暫存分支，讓 pCloud 有直連網址可抓。

```
生成 → 人工審查 → 調整直到核准 → tmp 分支 → pCloud 上傳 → 刪除分支 →（接上產品頁）
```

**沒有使用者明確的「核准」，不推分支、不上傳。** 「看起來不錯」「差不多」不算，要問清楚。

---

## 1. 規格

每個產品一個 pCloud 資料夾 `Public Folder/lazyrhythm/<Dir>/`（例：`SeamlessTrack`、`CotimeBook`）。
檔名沿用既有慣例，網站程式碼依檔名組網址，**不要改名**：

| 位置 | 檔名 | 尺寸 | 用途 |
|---|---|---|---|
| `<Dir>/website/` | `Hero 2400×1200@1x.png` | 2400×1200 | 產品頁頂部大圖 |
| `<Dir>/website/` | `OG 分享圖 1200×630@1x.png` | 1200×630 | og:image / 社群分享卡 |
| `<Dir>/website/` | `作品卡封面 1600×900@1x.png` | 1600×900 | `/works` 卡片（`PRODUCT_COVERS`） |
| `<Dir>/website/` | `功能 · <名稱>@1x.png` ×3 | 1600×1200 | 產品頁段落配圖 |
| `<Dir>/` | `01 <標題>@1x.png` … `05 …` | 1080×1920 | Google Play 手機截圖 |
| `<Dir>/` | `Feature Graphic 1024×500@1x.png` | 1024×500 | Google Play 主視覺 |

- `×` 是 U+00D7、`·` 是 U+00B7，前後各一個半形空格。
- 公開網址：`https://filedn.eu/lyWyjTiBuD9uWONu3Or0JNX/lazyrhythm/<Dir>/website/<檔名>`，
  檔名以 `encodeURIComponent` 編碼（`Hero%202400%C3%971200%401x.png`）。
- 使用者只要其中幾張時，只做那幾張。

## 2. 先查事實，再寫圖上的字

圖上的每一句話都是對外承諾，和產品頁文字同一套標準：

- 讀產品 repo（README、CLAUDE.md / AGENTS.md、changelog、相關原始碼），UI 畫面用 App 真實的字串、
  按鈕與流程；數字（上限、秒數、格式）要能在程式碼裡找到。
- 動筆前確認現況，任何一項不確定就問：
  - 有沒有廣告或付費（含**準備中的 PR**，不要寫「無廣告」）
  - repo 是否公開（會轉私有就不寫開源、不放 GitHub）
  - 商店是否已上架（未上架不放「Google Play 下載」）
  - 會換掉的實作細節（例如傳輸方式）不寫進圖裡，只寫對使用者的承諾
- 寫「這個 App 讓什麼變得可能」，不要虛構「大家現在都這樣做」的使用情境。
- 個人開發，不用「我們」；需要主詞時寫「開發者」。
- 圖裡出現的示範人名、書名、金額用中性假資料（公有領域書籍、小安／阿哲／Mia 這類名字）。

## 3. 生成

視覺沿用 Offbeat（`lazyrhythm-design` skill；不在時照既有圖）：Nord 深底 `#2E3440` 加細格線、
偏移實心陰影 `#5E81AC`、mono 小標 `// FEATURE · XXX`、粗黑大標、手機或電子閱讀器外框裡放真實 UI。
新做之前先看同一產品或其他產品現有的圖（pCloud `list_folder` 後從公開網址下載），保持一致。

1. 在 scratchpad 建 `promo/<slug>/src/`，一張圖一個 HTML，`<head>` 宣告輸出：
   ```html
   <meta name="asset" content="2400x1200" data-file="Hero 2400×1200@1x.png">
   ```
   `body` 設成同樣的寬高、`margin: 0`；字型用 Google Fonts（`display=block`），其餘 inline。
2. 渲染（腳本會等字型載入並警告內容溢出）。Playwright 不是專案依賴：Claude Code 雲端 session 已預裝，
   其他環境先執行 `npm i --no-save playwright && npx playwright install chromium`，不要寫進 `package.json`：
   ```bash
   node .claude/skills/product-assets/render.mjs <src-dir> <out-dir>            # 全部
   node .claude/skills/product-assets/render.mjs <src-dir> <out-dir> "功能 ·"   # 只重渲染部分
   ```
3. 自己先用 Read 看過每一張：字有沒有被裁、有沒有溢出、中文有沒有掉成 fallback 字型、
   UI 是否與 App 一致。自己看得出的問題先修，不要交給使用者抓。

## 4. 人工審查與調整

1. 用 `SendUserFile`（`display: "render"`）把所有圖一次送出，附一段清單：每張圖的檔名、尺寸、
   圖上主要文案，以及哪些內容是依哪份文件寫的、哪些是你的假設。
2. 使用者給意見後：只改被點到的地方，重渲染受影響的圖，**只重送改過的圖**，並說明改了什麼。
   一處意見若影響其他圖（例如改了名稱或文案），一起改並說明。
3. 重複直到使用者明確核准，並確認核准範圍（全部，或其中幾張）。只上傳核准的圖。

## 5. 推到暫存分支

pCloud 只能從直連網址抓檔，所以借 `dwvwdv/Lazyrhythm`（公開 repo）的一條暫存分支。
這條分支是本流程的一部分，不開 PR、不合併，用完即刪。

```bash
SCRATCH=<scratchpad 目錄>; SLUG=<slug>; BR="tmp/assets-$SLUG-$(date +%Y%m%d%H%M)"
git fetch origin master
git worktree add -b "$BR" "$SCRATCH/assets-wt" origin/master   # 不動目前工作中的分支
mkdir -p "$SCRATCH/assets-wt/promo/$SLUG"
# 只複製核准的檔案：分支是公開的，未核准的草稿一推上去就公開了
APPROVED=("Hero 2400×1200@1x.png" "OG 分享圖 1200×630@1x.png")   # 照核准清單逐一列出
for f in "${APPROVED[@]}"; do cp "<out-dir>/$f" "$SCRATCH/assets-wt/promo/$SLUG/"; done
git -C "$SCRATCH/assets-wt" add "promo/$SLUG"
git -C "$SCRATCH/assets-wt" commit -m "暫存 $SLUG 宣傳圖供 pCloud 上傳（上傳後刪除此分支）"
git -C "$SCRATCH/assets-wt" push -u origin "$BR"
```

確認每個檔案的 raw 網址都回 200，且大小與本機相同：
`https://raw.githubusercontent.com/dwvwdv/Lazyrhythm/<BR>/promo/<slug>/<encodeURIComponent(檔名)>`
（分支名裡的 `/` 不要編碼）。

## 6. 上傳到 pCloud

1. 找資料夾：`list_folder` 從 `Public Folder`（folder id `20219370281`）→ `lazyrhythm`
   （`20602801950`）往下找；沒有就 `create_folder_if_not_exists` 建 `<Dir>` 與 `website`。
   id 以實際查到的為準。
2. 同名檔案已存在時，先 `create_folder_if_not_exists` 建 `<Dir>/_archive`，用 `move_file` 把舊檔移進去
   （必要時 `rename_file` 加上日期），讓新檔沿用原檔名、網址不變。沒有刪除工具，也不需要刪。
3. `upload_from_url`：`url` 放 raw 網址、`target` 放編碼後的原檔名、`folder_id` 放目標資料夾。
   一個資料夾一次呼叫（website 與 Play 圖分兩次）。
4. 用回傳的 `progresshash` **與 `hostname`** 呼叫 `get_upload_progress`，直到 `finished`；
   任何一個檔案是 `error` 就重傳那一個。
5. 驗證：`list_folder` 確認檔名完全一致（沒有 ` (1)` 之類的重名副本）、`size` 與本機相同、
   `width`/`height` 正確；再對每個 `filedn.eu` 公開網址 `curl` 確認 200 與 `content-length`。
   任何一項不符就停下來，先處理，不要刪分支。

## 7. 刪除暫存分支

只有第 6 步全部驗證通過才刪：

```bash
git push origin --delete "$BR"
git worktree remove "$SCRATCH/assets-wt" && git branch -D "$BR"
git ls-remote origin "$BR"   # 應該沒有輸出
```

## 8. 接上產品頁（需要時）

圖上傳後若要用在網站，走一般 PR（指定的開發分支），不是暫存分支：

- `src/app/products/<slug>.ts`：`dir` 指向 `…/lazyrhythm/<Dir>/website`，`hero`、`og`、各段 `image`
  填入編碼後的檔名與實際寬高，`alt` 描述圖上真正呈現的內容。
- `src/app/products/product-index.ts`：`PRODUCT_COVERS['<slug>']` 指向作品卡封面。
- 替換既有圖片時網址不變，網站不用改；但瀏覽器與社群平台可能快取舊圖，告訴使用者。
- `npm run build`（含 `verify-seo`）與單元測試要過。

## 回報

結束時告訴使用者：上傳了哪些檔案（含公開網址）、移到 `_archive` 的舊檔、暫存分支已刪除，
以及還沒做的事（例如產品頁尚未接上、Play Console 要手動上傳截圖）。
