# 前端假登入模式與相關說明（userlog112205）

本文件紀錄了為了便於本機測試而新增的「前端假登入模式（Mock Auth）」與相關背景、使用方式、修改檔案、及常見問題排查。亦包含課程模組與資料庫類型不一致（courses.id）的修正紀錄，方便後續追蹤。

---

## 背景與目的
- 在未連線或尚未完成後端的情況下，開發者仍希望能於本機模擬登入/登出流程，並讓頁面可取得當前使用者（例如「水球潘」）的資料。
- 為此，前端新增「MOCK_AUTH」開關，啟用後：
  - 登入 API 直接使用前端的假資料，設定 mock cookie。
  - /api/auth/me 直接從前端 data/users 讀取對應使用者 JSON。
  - 登出 API 清除 mock cookies。

---

## 使用方式

### 1) 啟用 Mock 模式
- 在專案根目錄新增或調整 `.env`（或你使用的環境變數設定），加入：

```
MOCK_AUTH=true
```

- 重新啟動前端開發伺服器或容器。

### 2) 登入
- 前往登入頁：http://localhost:3000/auth/login
- 使用以下任一 email 登入（密碼目前不檢查，可輸入任意字串）：
  - waterball@example.com
  - alice@example.com
  - bob@example.com
- 成功後會設定兩個 cookie：
  - `token=mock-token`：供 UI 判斷為已登入狀態
  - `mock_user=<key>`：記錄使用哪個假用戶（例如 `waterball`）

### 3) 取得登入狀態
- 前端路由 `/api/auth/me` 若偵測 `MOCK_AUTH=true`，會：
  - 讀取 `mock_user` cookie
  - 回傳 `frontend/data/users/<mock_user>.json` 對應內容（例如 name、avatar、role 等）

### 4) 登出
- 呼叫前端路由 `POST /api/auth/logout`：
  - 會清除 `token` 與 `mock_user` 兩個 cookie
  - UI 導向登入頁

---

## 假用戶資料位置
- 目錄：`frontend/data/users`
- 目前內建：
  - `waterball.json`（水球潘）
  - `alice.json`（愛麗絲）
  - `bob.json`（小博）
- 欄位說明（節錄）：
  - id, username, name, email, studentId, occupation
  - level, completedGyms
  - birthday, gender, location
  - githubUrl, discordConnected, githubConnected
  - avatar（/public 下對應的資源路徑）

你可以複製任一 JSON 另存新檔，快速新增更多假用戶。

---

## 與後端整合（非 Mock 模式）
- 當 `MOCK_AUTH=false`（預設）時：
  - `POST /api/auth/login`：代理呼叫後端 `${NEXT_PUBLIC_API_BASE_URL}/api/auth/login`，成功後把後端回傳的 JWT 寫入 httpOnly `token` cookie。
  - `GET /api/auth/me`：從 cookie 取出 `token`，代理呼叫後端 `/api/auth/me`，透傳回應。
  - `POST /api/auth/logout`：單純清除前端 `token` cookie（後端 stateless）。

- 先前也提供了開發用 seed 路徑：
  - `POST /api/dev/seed/waterball`：呼叫後端 `/api/auth/register` 以 `waterball@example.com / password` 建立帳號。若使用者已存在會回 409，seed 視為可接受狀態（不會重設密碼）。

---

## 修改檔案一覽
- 前端 API 路由（支援 Mock 與後端代理）
  - `frontend/app/api/auth/login/route.ts`
    - 新增 MOCK_AUTH 模式：
      - 依登入 email 對應 `frontend/data/users/<key>.json` 是否存在
      - 設定 `token=mock-token` 與 `mock_user=<key>` cookies
      - 若 `MOCK_AUTH=false` 則代理呼叫後端
  - `frontend/app/api/auth/me/route.ts`
    - 新增 MOCK_AUTH 模式：
      - 從 cookies 讀取 `mock_user`，讀取對應 JSON，回傳使用者資料
      - 若 `MOCK_AUTH=false` 則代理呼叫後端並透傳
  - `frontend/app/api/auth/logout/route.ts`
    - 登出時一併清除 `mock_user` cookie

- 假用戶資料
  - `frontend/data/users/waterball.json`
  - `frontend/data/users/alice.json`
  - `frontend/data/users/bob.json`
  - `frontend/data/users/README.md`

- 範例環境變數
  - `.env.example` 新增 `MOCK_AUTH=false`

---

## 常見問題排查（Login 403/401 與其他）
1) 登入回 403（或 401）
   - Mock 模式：
     - 確認 `MOCK_AUTH=true` 且輸入的 email 有對應 JSON 檔（例如 `waterball.json`）
     - 若找不到對應檔案會回 404，未對應則回 403
   - 後端模式：
     - 多半是帳號已存在但密碼不同（使用者先前以不同密碼註冊過），建議：
       - 重新註冊或提供「開發用強制重設密碼」端點（可另行實作）
       - 或直接刪除 DB 中該使用者，重新註冊
     - 確認後端運行正常（`/api/health` 應回 `{status: "ok"}`）

2) 在 Docker Compose 中跨域問題
   - 目前後端已將 CORS 參數化，可用環境變數覆蓋：
     - `APP_CORS_ALLOWED_ORIGINS`, `APP_CORS_ALLOWED_METHODS`, `APP_CORS_ALLOWED_HEADERS`
   - `docker-compose.yml` 的 backend 服務已提供預設樣板，部署時請依實際域名調整。

---

## 課程資料庫主鍵型別修正（參考）
- 現象：Hibernate 驗證出現
  - `Schema-validation: wrong column type encountered in column [id] in table [courses]; found [serial (Types#INTEGER)], but expecting [bigint (Types#BIGINT)]`
- 原因：JPA `Course.id` 使用 `Long`（對應 BIGINT），但資料表 `courses.id` 是 `integer/serial`。
- 修正：新增 Flyway migration `V4__alter_courses_id_bigint.sql`：

```
ALTER TABLE courses
  ALTER COLUMN id TYPE BIGINT USING id::BIGINT;
```

- 作法：重啟後端以套用 migration 後，Hibernate 驗證會通過。

---

## 後續建議
- 若要完全去除前端的硬寫 mock user（例如 Header 中的示範資料），可改為統一使用 `/api/auth/me` 回傳的資料。
- 若要測試不同角色（例如 ADMIN），可以在 `mockUsers` 映射中賦予不同 role，或在 JSON 加上角色資訊並於 `/api/auth/me` 回傳。
- 若要讓 `/profile` 僅限登入者瀏覽，可於 `middleware.ts` 對 `/profile` 也做保護（未帶 token 或 mock_user 時導向 `/auth/login`）。

---

如需我幫你把這份說明同步到 Confluence，或建立 Jira 工作項目（例如「改 Header/Profile 以使用 /api/auth/me」、「新增 ADMIN 角色 mock 用戶」、「實作開發用密碼重設端點」），請告訴我要建立在哪個專案與看板欄位。