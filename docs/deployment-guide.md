# 部署指南：前端至 Vercel，後端與資料庫至 Render

由於專案已停止開發並轉換為靜態作品展示目的，此文件記錄如何將前端（Next.js）部署至 Vercel，並將後端（Spring Boot API）與資料庫（PostgreSQL）部署至 Render 的詳細步驟。

這種部署架構能最大化利用兩方平台的免費額度，並維持相對簡單的維護成本。

---

## 佈署順序建議

請務必**先部署後端與資料庫 (Render)**，再部署**前端 (Vercel)**。
理由是前端 Next.js 部署時，需要設定後端的 API 網址（`NEXT_PUBLIC_API_BASE_URL`）作為環境變數。

---

## 步驟一：在 Render 部署後端 (Spring Boot) 與 PostgreSQL

因為這是一個 Monorepo（前後端原始碼在同一個 Git Repository），Render 提供了很方便的 Root Directory 設定功能。

### 1. 建立 Render 資料庫

1. 登入 Render，點擊 **New** -> **PostgreSQL**。
2. 填寫 Name (例如: `waterballsa-db`)，拉到最下面的 Instance Type 選擇 **Free (免費)**，點擊 **Create PostgreSQL**。
3. 建立完成後，在畫面上找到 **Internal Database URL**（開頭會是 `postgres://...`），把這整串複製下來。它等同於包含了所有的連線帳號密碼與資料庫位址。

### 2. 後端程式碼修改 (Spring Boot)

為了讓 Spring Boot 能動態讀取 Render 的設定，你需要將原有的變數對接 `Internal Database URL`。但因為我們原本的架構是拆散的（`POSTGRES_HOST`, `_PORT`, `_USER`, `_PASSWORD`），最簡單的方式就是在 Render 的 **Web Service** 中直接建立這些分散的變數。

如果你使用的是 `application.yml`，它原本應該長這樣：

```yaml
spring:
  datasource:
    url: ${SPRING_DATASOURCE_URL:jdbc:postgresql://localhost:5432/appdb}
    username: ${SPRING_DATASOURCE_USERNAME:appuser}
    password: ${SPRING_DATASOURCE_PASSWORD:apppass}
```

_（不需要修改程式碼，我們在渲染端設定即可）_

### 3. 從 GitHub 部署後端 API (Web Service)

1. 回到 Render Dashboard，點擊 **New** -> **Web Service**。
2. 選擇 **Build and deploy from a Git repository**，授權並連線你的 GitHub。
3. 進入設定畫面，這非常關鍵：
   - **Name**: （隨便填，例如 `waterballsa-api`）
   - **Root Directory**: `backend` (非常重要！)
   - **Environment**: 選擇 `Docker` (這會讓 Render 自動去吃你的 `backend/Dockerfile`，省去寫 Maven 編譯指令的麻煩)
   - **Instance Type**: 免費方案 (Free)
4. 點擊畫面下方的 **Advanced**，新增環境變數 (Environment Variables)：
   - 新增 `SPRING_DATASOURCE_URL`：填寫 `jdbc:postgresql://...` (把剛才複製的 Internal Database URL 開頭的 `postgres://` 換成 `jdbc:postgresql://`，其餘照抄)
   - （如有密碼或帳號需要拆開設定，請參考該畫面的 Username 與 Password，通常直接把整串塞給 SPRING_DATASOURCE_URL 即可）
   - 新增 Google OAuth 金鑰（`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`）
5. 點擊 **Create Web Service**，系統會開始執行你的 Dockerfile 將 Java 專案啟動！
6. **記下此服務產生的網域名稱**（例如：`waterballsa-api.onrender.com`），這是接下來 Vercel 前端要串接的 API Base URL。

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
