# 1120 Debug Note — 課程頁內容異常與修復方案

本文紀錄 11/20 發現的「courses 課程頁內容變少/不見」問題、原因與可行修復方案，便於隔天接續處理。

## 問題現象
- 使用者回報：courses 課程頁原本顯示兩門課，後來變少或不見。

## 初步研判
- 前端頁面（/app/courses/page.tsx）過去使用預設的 demoCourses（2 門）。
- 近期調整後，頁面若能成功呼叫後端 `/api/courses`，就改用後端回傳資料；僅在後端不可達或失敗時才 fallback 到 demoCourses。
- 目前後端的 `CourseController` 只回傳 1 筆固定資料：`Intro to React`。
- 因此：
  - 後端可達時：頁面最多顯示 1 門（不是 2 門）。
  - 如果頁面完全空白，較可能是容器或快取問題（例如前端容器未重建，環境變數未生效導致 SSR 取用 API 失敗；或 .next 產物未刷新）。理論上我們有 fallback 機制，仍應顯示 demoCourses（2 門）；若全空，需檢查容器重建與日誌。

## 可能根因
1) 後端 `/api/courses` 僅回傳 1 筆，因此顯示少於預期（不是 bug，屬設計變更帶來的效果）。
2) 容器環境的 API Base URL 設定問題：
   - 之前 frontend 在 docker-compose 中把 `NEXT_PUBLIC_API_BASE_URL` 設為 `http://localhost:8080`，對「前端容器」來說 `localhost` 指向自己，而非 backend 容器，導致 SSR/前端 API route 取用後端失敗。
   - 已修正為 `http://backend:8080`，但需要重建前端容器才會生效。
3) 快取/建置產物未清：
   - 本機需清除 `.next` 或重新建置；
   - 容器需 `build --no-cache` 後再啟動。

## 修復方案（擇一採用）
A) 後端回傳兩門課（最快恢復既有體驗）
- 更新 `CourseController` 的 `/api/courses`，讓回傳資料包含 2 筆（可對齊 demoCourses）。
- 優點：資料來源一致，前端直接顯示兩門；後續再接 DB 也容易。

B) 前端自動補齊策略（後端為 0/1 筆時補 demo）
- 若後端回傳少於 2 筆，前端在整併資料時自動補上 demoCourses 至至少 2 筆。
- 優點：前端韌性較高；缺點：資料來源混合，後續需要統一資料來源策略。

C) 暫時完全使用 demoCourses（忽略後端）
- 短期內先固定展示 demoCourses，待後端完成資料擴充/接 DB 後再切回。
- 優點：立即回復兩門課；缺點：與後端脫鉤。

## 建議的操作步驟（Docker Compose 環境）
1) 確保已更新 docker-compose 的 frontend API Base URL：
   - `NEXT_PUBLIC_API_BASE_URL: http://backend:8080`
2) 重建與啟動：
   - `docker compose down`
   - `docker compose build --no-cache frontend`
   - （必要時）`docker compose build backend`
   - `docker compose up -d`
3) 驗證：
   - 確認後端健康檢查：`curl -i http://localhost:8080/api/health` → 200 + `{ "status": "ok" }`
   - 打開 `http://localhost:3000/courses` 確認顯示是否符合預期。
4) 若仍空白：
   - 檢視容器日誌：`docker compose logs -f frontend`、`docker compose logs -f backend`
   - 檢視瀏覽器 Network 的 `/api/courses` 回應狀態碼與內容。

## 其他已做的強化（避免前端崩潰）
- 前端 API routes（register/login/me）加入安全 JSON 解析與網路錯誤處理，避免 `Unexpected end of JSON input`。
- 針對頁面與 UI 元件的 `toLocaleString` 進行防呆：一律先用 `Number(value ?? 0).toLocaleString()`，避免對 `undefined/null` 呼叫導致 SSR 錯誤。
- courses 頁面在接後端資料時做型別正規化：將數值欄位轉為數字、補齊必要欄位的預設值，避免渲染期錯誤。

## 待辦與後續建議
- 選定方案（A/B/C）並實作：
  - A：後端補齊兩筆資料。
  - B：前端補齊策略與 UI 註記資料來源。
  - C：短期鎖定 demoCourses，並規劃後端資料化改造時程。
- 中長期：
  - 以 DB 為最終單一資料來源，建立 Course 實體 / Repository / Service，Flyway 加入種子資料。
  - 增加端到端測試（例如 Playwright）驗證課程列表顯示筆數與內容。
