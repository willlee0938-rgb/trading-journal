# Trading Thesis Journal

這是一個純前端、可離線使用的交易規劃與復盤網站。

## 使用
- 直接開啟 `index.html`，或用任意靜態網站服務器啟動。
- 內建 2026-10-14 BTC CPI 規劃與 9 張原始截圖。
- 「新增紀錄」可建立新交易規劃並上傳圖片。
- 新增內容儲存在瀏覽器 `localStorage`。
- 「資料管理」可匯出 / 匯入 JSON 備份。

## 建議上線方式
可直接部署到 GitHub Pages、Netlify、Vercel、Cloudflare Pages 等靜態託管。

## AI 交易助手（第一階段）
- 右下角「AI 交易助手」可輸入問題，預覽最新交易劇本的核心邏輯、關鍵價位與失效條件，再帶到 ChatGPT 討論。
- 這是前往 ChatGPT 的連結功能，網站內沒有即時 AI 回覆，也沒有使用或儲存 OpenAI API Key。可能需要登入 ChatGPT。
- 劇本與問題會包含在 ChatGPT 連結中；若未自動帶入，使用「複製完整內容」貼上。過長內容改以完整複製處理，不截斷劇本。
- `ai-assistant.js` 只在開啟、輸入與操作時讀取 `getLatestEntry()`，不修改首頁渲染函式、不輪詢、不使用 MutationObserver。樣式位於 `ai-assistant.css`，只套用於助手。
- 本機驗證請從專案的上層目錄執行 `python3 -m http.server 8000`，以 `/trading-journal/` 路徑開啟，配合既有圖片路徑。
- 瀏覽器回歸測試：具備 Python Playwright 與 Chromium 的環境中執行 `python3 tests/test_ai_assistant.py`。可用 `BASE_URL` 與 `CHROMIUM_BIN` 指定網址與瀏覽器。測試會攔截 ChatGPT 分頁連結，不會將測試內容送出。

## 注意
本網站是交易研究與復盤工具，不代表任何交易建議。事件前假設與事件後結果應分開記錄，以避免 hindsight bias。
