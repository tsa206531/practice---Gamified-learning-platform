# 開發紀錄（2025-11-23）

本日重點完成與調整項目如下，涵蓋帳號系統擴充、Google Auth 導入、權限與錯誤處理強化，以及課程影片播放體驗優化。

---

## 今日完成事項

### 1) 會員系統擴充（Profile 資料 + 變更密碼）
- DB（Flyway）：新增使用者擴充欄位
  - V6__users_add_profile_fields.sql：occupation、birthday、gender、location
  - V7__users_oauth_columns.sql：provider、provider_id、avatar
- 後端 API：
  - GET /api/users/me 與 PATCH /api/users/me：回傳與更新上述新增欄位
  - POST /api/users/me/password：驗證目前密碼、更新新密碼（長度基本校驗）
- 前端：
  - /profile 頁面：呈現並可編輯 occupation、birthday、gender、location；新增「變更密碼」UI（目前密碼 + 新密碼 + 確認新密碼）
  - /api/users/me（API Route）：PATCH 轉發上述欄位至後端

### 2) 權限與錯誤處理強化
- 後端 Spring Security 統一 JSON 錯誤回應
  - Unauthorized → {"error":"Unauthorized"}
  - Forbidden → {"error":"Forbidden"}
  - 修正 javax → jakarta 命名空間相容問題
- 前端 middleware
  - 當 MOCK_AUTH=false（真實登入模式），必須有 token 才能進入受保護頁面（/profile、/rewards、/admin），不再接受 mock_user

### 3) Google Auth（方案 A：前端拿 Google ID Token → 後端驗證 → 簽發本地 JWT）
- 後端 /api/auth/google：
  - 使用 Google tokeninfo 端點驗證 ID Token（MVP），校驗 aud（對應 GOOGLE_CLIENT_ID）、email_verified、email/sub
  - 查/建 user（provider=GOOGLE、providerId=sub、avatar=picture），簽發本地 JWT
- 前端：
  - /api/auth/google（API Route）：轉發 idToken，成功後設定 httpOnly token cookie
  - 登入頁導入 Google 按鈕（Google Identity Services），可完成 Google 登入
- UI 顯示：
  - Header 顯示使用者 avatar（若為 Google 登入則顯示 Google 大頭貼）
  - Profile 顯示 provider（登入來源，例如 GOOGLE / LOCAL）

### 4) /api/users/me 401 問題排查與修復
- 新增 JwtAuthFilter 調試日誌：
  - 無 Authorization header、非 Bearer、解析失敗、或成功建立身份時的訊息
- 臨時 fallback（已移除）：先讓 /profile 能正常顯示，後續正式修復後刪除
- 正式修復：透過 JwtAuthFilter 正確解析、建立身份；/api/users/me 僅依賴標準流程

### 5) 課程影片播放（YouTube）
- 兩門課程（software-design-patterns、ai-bdd）各 5 支影片的靜態對應
- 將播放器改為 react-youtube，實作 onEnd 行為：
  - 非最後一部：顯示「恭喜你完成了單元！將於 5 秒後自動播放下一部」的浮動提示（含「立即播放下一部」按鈕），並自動倒數切換
  - 最後一部：顯示「恭喜你完成了本課所有單元！」提示，可引導返回課程列表

---

## 後續建議優先序

### A. 課程核心體驗
1) 影片進度追蹤（前後端）
   - 前端：基於 YouTube Player API 進度事件／時間輪詢，標記開始/更新/完成
   - 後端：User-Unit 進度 API（PATCH/POST），記錄完成時間與百分比
2) 單元完成 → EXP 發放
   - 後端：依 PRD 規則累計 EXP 與等級；聚合排行榜（全時/本週）
   - 前端：完成動畫、EXP 進度條，排行榜串接
3) 道館/作業初版
   - 後端：提交、老師評級、徽章授予（先用簡化管理 API）
   - 前端：挑戰 UI、提交表單、結果呈現

### B. 身份與安全
1) Google 驗證改為「本地驗簽」
   - 改用 Google 公鑰本地驗簽，降低對 tokeninfo HTTP 呼叫依賴、縮短延遲
2) 欄位與流程驗證
   - Profile 欄位加上後端 Bean Validation 與前端表單驗證
   - 變更 Email 流程（唯一性檢查 + 驗證信）
3) middleware 與 API 行為一致性
   - 確保所有受保護頁面/端點對 token 的要求一致，避免頁面可進但 API 401 的情況

### C. 開發者體驗與品質
1) E2E 測試（Playwright）
   - 註冊/登入（含 Google）→ 進 /profile → 修改資料 → 播放影片 → 完成提示 → 自動播下一部
2) 後端整合測試
   - Auth、Users、Progress、EXP、Leaderboard 等核心流程
3) Observability
   - 關鍵事件 log（登入、變更密碼、單元完成）、metrics、錯誤追蹤（Sentry/類似工具）

### D. 營運面功能
1) 訂單/購買 MVP（假支付）
   - 建立訂單 → 標記付款成功 → 開通課程權限
2) 後台維運頁
   - 課程/單元管理、用戶查詢、EXP 調整、徽章授予（最小可行）

---

## 補充說明與提醒
- 前後端環境變數請同步：
  - 前端：frontend/.env.local 中 NEXT_PUBLIC_GOOGLE_CLIENT_ID
  - 後端：GOOGLE_CLIENT_ID（audience 校驗）、APP_JWT_SECRET（JWT 簽章密鑰）
- 若採 Docker Compose，請在 compose 檔或服務環境中注入上述變數
- Google OAuth 設定：
  - Authorized JavaScript origins：包含 http://localhost:3000（開發）
  - Authorized redirect URIs：視需求設定；本案採 ID Token 模式，不需要 OAuth redirect flow

---

## 建議下一步我可以幫你做什麼？
- 我可以幫你：
  1) 實作「影片進度追蹤 + 單元完成 → EXP 發放 + 排行榜聚合」的 MVP
  2) 將 Google 驗證改為本地驗簽，移除對 tokeninfo 的依賴
  3) 撰寫 Playwright E2E：Google 登入 → /profile → 播放與自動切換 → 完成提示
  4) 建立 PR 與 Confluence 文件，整理架構與設定清單

請告訴我你想先從哪一項開始，我就排進下一輪開發。