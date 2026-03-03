# 功能清單與驗收說明（FD）

本文整理本專案目前已開發的功能與可驗收項目，並標註哪些畫面僅有 UI（尚無完整功能）。另附上影片進度追蹤（固定時間上報、反作弊 watched_ranges）的說明與驗收方法。

---

## 已完成（可操作、可驗收）的功能

1) 課程播放與單元管理（Course）
- 路徑：/course/[slug]
- 功能：
  - 播放課程單元影片（YouTube embed）。
  - 影片看完會出現完成提示（可自動導引下一單元）。
  - 影片看完「手動交付」經驗值（EXP），顯示於頁面與下拉選單（dropdown-menu）。
  - 每 10 秒自動上報觀看進度到 Next.js API（/api/progress），後端以 watched_ranges 合併計算實際播放時間，避免直接拖到尾端被算完成。
  - 當 watched_seconds >= duration - 2 秒，自動判定單元完成（無需手動按「完成」）。
  - UI 顯示：
    - 課程整體交付進度（已交付/總單元）。
    - 目前單元的「已觀看百分比」（watched_seconds / duration）。

2) 身分驗證與 Google Auth 登入
- 路徑與 API：/api/auth/google/*、/api/auth/login、/api/auth/logout、/api/auth/register、/api/users/me
- 功能：
  - 支援 Google Auth 登入流程。
  - 提供登入、登出、註冊與目前使用者資訊的 API（整合後端或以代理方式）。

3) 個人資料頁與可編輯欄位
- 路徑：/profile
- 功能：
  - 顯示個人基本資料、等級、經驗值（EXP）。
  - 可編輯並儲存姓名、Email、性別、國家、生日等欄位。
  - 顯示等級升級（Level Up）與 EXP 增加的 UI 回饋（個人頁與 dropdown-menu）。

4) 課程權限（購買後才可看）
- 路徑：/course/[slug] 與 /purchase/[slug]
- 功能：
  - 未購買的課程單元會鎖定（Lock），顯示需購買提示。
  - 完成購買後，即可解鎖並觀看課程內容。

5) 購買頁功能
- 路徑：/purchase/[slug]
- 功能：
  - 以頁面流程引導完成購買（開發/DEMO 流程），成功後更新課程權限。

6) 挑戰道館（Challenges Gym）
- 路徑：/challenges
- 功能：
  - 兩種模式：速戰速決、實戰演練。
  - 上傳挑戰作業（圖片），並於挑戰歷程中顯示已上傳作業紀錄。
  - 相關 API：/api/submissions（GET/POST，記憶體暫存於開發模式）。

7) 排行榜（Leaderboard）
- 路徑：/leaderboard
- 功能：
  - 顯示排行榜名次（代理後端或本地模擬）。
  - 合併本地 EXP/等級資訊顯示當前使用者的名次區塊。

8) 前端體驗強化
- RWD：適配手機、平板、桌機的響應式設計。
- 深/淺色模式切換：提供夜間/日間主題。

---

## 僅有頁面（UI 為主）

以下頁面主要提供 UI 展示或 DEMO，尚未串完整後端或正式流程：
- 首頁：/（宣傳與導覽）
- 單元：/units（內容清單與示意展示）
- 獎勵：/rewards（展示獎勵卡片）
- 地圖：/map（視覺化地圖互動，以前端為主）
- 其他未標註 API 或權限檢核的細節頁面

說明：上述頁面可正常瀏覽並具備基本互動，但功能以展示為主，尚無完整後端資料與驗證規則。

---


## 開發與執行方式（本機）

- 前端
  - 指令：在 frontend/ 執行 `pnpm dev`（或使用 docker-compose 啟動）。
  - 預設網址：http://localhost:3000
  - 環境變數：NEXT_PUBLIC_API_BASE_URL（如需呼叫後端服務）、Google Auth 相關設定（如有）。

- 後端
  - 本倉庫包含 Spring Boot 專案骨架與 Dockerfile。現階段影片進度由 Next API route 提供暫存；正式環境建議持久化至 Spring Boot + Postgres。

---

## 既知限制與未來擴充建議


建議
- 後端持久化：
  - 資料表 video_progress(user_id, video_id, duration_seconds, last_position, watched_ranges JSONB, watched_seconds, is_completed, updated_at)。
  - 提供正式 API（PUT/GET），前端改呼叫 Spring Boot 後端。
- 前端回報強化：
  - 附帶 isSeeking、playbackRate、clientTimestamp，以利後端更準確判斷。
  - 多分頁協調（同一 user+video 僅一個心跳來源為主）。
- 視覺化：
  - 在進度條上渲染 watched_ranges（片段化顯示實際已看區域），加強使用者理解與防作弊效果。

---

