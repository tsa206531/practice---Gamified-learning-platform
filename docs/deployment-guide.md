# 部署指南：前端至 Vercel，後端與資料庫至 Zeabur

由於專案已停止開發並轉換為靜態作品展示目的，此文件記錄如何將前端（Next.js）部署至 Vercel，並將後端（Spring Boot API）與資料庫（PostgreSQL）部署至 Zeabur 的詳細步驟。

這種部署架構能最大化利用兩方平台的免費額度，並維持相對簡單的維護成本。

---

## 佈署順序建議

請務必**先部署後端與資料庫 (Zeabur)**，再部署**前端 (Vercel)**。
理由是前端 Next.js 部署時，需要設定後端的 API 網址（`NEXT_PUBLIC_API_BASE_URL`）作為環境變數。

---

## 步驟一：在 Zeabur 部署後端 (Spring Boot) 與 PostgreSQL

因為這是一個 Monorepo（前後端原始碼在同一個 Git Repository），Zeabur 提供了很方便的 Root Directory 設定功能。

### 1. 建立 Zeabur 專案與資料庫

1. 登入 Zeabur，點擊 **Create Project** 建立一個新專案。
2. 在新專案中，點擊 **Add Service** -> 選擇 **Prebuilt** -> 找到並新增 **PostgreSQL**。
3. 等待資料庫啟動完成。點擊該 PostgreSQL 服務，進入 **Instructions** 頁籤。
4. 這裡會顯示資料庫的連線帳密與位址（例如：`POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`）。這在稍後會用到。

### 2. 後端程式碼修改 (Spring Boot)

為了讓 Spring Boot 能動態讀取 Zeabur 注入的 PostgreSQL 環境變數，你需要修改後端的 `application.properties` (或 `application.yml`)。

**修改 `backend/src/main/resources/application.properties`**：

```properties
# 讓 Spring Boot 讀取 Zeabur 提供的環境變數 (通常字首為 POSTGRES_)
spring.datasource.url=jdbc:postgresql://${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}
spring.datasource.username=${POSTGRES_USER}
spring.datasource.password=${POSTGRES_PASSWORD}
```

**CORS 設定提醒**：
前端部署到 Vercel 後會有一個專屬網域（例如：`https://my-portfolio-frontend.vercel.app`）。
請記得在後端的 **Spring Security 或是 WebMvcConfigurer 的 CORS 設定** 中，將這個未來的 Vercel 網域加入到 allowed origins 清單，否則前端會有 CORS 錯誤。

### 3. 從 GitHub 部署後端服務

1. 在同一個 Zeabur 專案中，點擊 **Add Service** -> 選擇 **Git** -> 授權並選擇你的 GitHub 儲存庫。
2. 服務新增後，進入該服務的 **Settings** (設定) 頁面。
3. 找到 **Build & Deploy** -> 將 **Root Directory** 設定為 `backend`。
   _(Zeabur 會進入該目錄尋找 `pom.xml` 或 `Dockerfile` 並自動打包 Java 專案)_
4. 進入 **Variables** (環境變數) 頁面，確認是否需要手動補齊變數（通常 Zeabur 內同專案的 Service 變數會自動分享，但若有 Google OAuth 等自訂變數，如 `GOOGLE_CLIENT_ID`，請手動加入）。
5. 部署成功後，進入 **Domain** 頁籤，綁定一個免費的 `.zeabur.app` 網域（例如：`waterball-api.zeabur.app`）。
6. **記下此域名**，這是接下來 Vercel 前端要串接的 API Base URL。

---

## 步驟二：在 Vercel 部署前端 (Next.js)

取得後端 API 網址後，就可以開始部署前端。Vercel 是 Next.js 的母公司，支援度極佳且設定最少。

### 1. 建立 Vercel 專案

1. 登入 Vercel，點擊右上方 **Add New** -> 選擇 **Project**。
2. 匯入同一個 GitHub 儲存庫。
3. 進入 **Configure Project** 畫面，請務必進行以下設定：
   - **Framework Preset**: 確認選擇 `Next.js`。
   - **Root Directory**: 點擊 Edit，選擇 `frontend` 資料夾。
   - **Build and Output Settings**: 保持預設即可（Vercel 預設支援 `pnpm`，會自動執行 `pnpm run build`）。

### 2. 設定前端環境變數 (Environment Variables)

在同一個 Configure 頁面下方，展開 Environment Variables，依據你的前端 `.env.local` 需求填入：

- `NEXT_PUBLIC_API_BASE_URL`: 填入步驟一在 Zeabur 取得的後端 API 網址（例如：`https://waterball-api.zeabur.app`）。**特別注意結尾不要加上斜線 `/`**。
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`: 你的 Google OAuth Client ID。
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`: 你的 Cloudinary 名稱。
- `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`: 你的 Cloudinary 上傳 Preset。

填寫完畢後點擊 Deploy 即可。

### 3. 取得 Vercel 網域

部署完成後，Vercel 會配發一個公開網域（例如：`https://your-project.vercel.app`）。

---

## 步驟三：關鍵收尾 (Google OAuth 白名單更新)

這是一般部署最容易忘記的步驟。當你的前後端網域都換成雲端網址後，現有的 Google 登入功能會失效（出現 `redirect_uri_mismatch` 錯誤）。

1. 前往 **Google Cloud Console** (GCP)。
2. 進入 API 果憑證 -> **OAuth 2.0 Client IDs**。
3. 尋找並更新你的 Web Client ID 設定：
   - **已授權的 JavaScript 來源 (Authorized JavaScript origins)**：新增你的 Vercel 網域（例如：`https://your-project.vercel.app`）。
   - **已授權的重新導向 URI (Authorized redirect URIs)**：根據你前端程式碼的實作，新增對應的回傳網址。如果有用類似 NextAuth 或前端自己接 Callback 的，要把 localhost 的路徑全部換成 Vercel 或 Zeabur 網址。

---

## 測試驗證流程

部署全數完成後，請依序執行以下測試確認功能正常：

1. **後端連線**：去瀏覽器直接開啟後端的健康檢查端點（如 `https://<zeabur-domain>/actuator/health`），應該要回傳 200 HTTP 狀態碼與對應 JSON。
2. **前端頁面載入**：開啟 Vercel 給的網址，確認首頁可以正常算圖，且沒有收到 500 內部伺服器錯誤。
3. **CORS 與 API 串接**：開啟瀏覽器開發者工具 (F12) 的 Network (網路) 頁籤，在前端網站上嘗試觸發 API（例如發布文章或看評論）。確認 Request 有順利發送到 Zeabur 的網址，並且沒有紅字的 CORS Error。
4. **驗證與登入**：嘗試用 Google 登入，確認是否能順利跳轉回前端頁面並且成功帶著 Token 繼續接下來的操作。
