# 快速本機開發執行（DB 用 Docker，前後端本機執行）

這份文件說明在你頻繁開發功能（例如會員登入、Session、DB 結構修改、API 調整）時，如何用最快速的方式開發並獲得即時回饋，而不需要反覆重建 Docker 映像。

核心觀念：在開發環境下，不要為前端或後端重建 Docker 映像。只使用 Docker 來啟動資料庫，前端與後端在本機以熱重載（hot reload）方式執行。

---

## 概覽
- 資料庫：使用 Docker 執行（並保留資料卷）
- 後端（Spring Boot）：本機執行（`mvn spring-boot:run` 或 IDE）
- 前端（Next.js）：本機執行（`pnpm dev`）
- 開發環境 API Base URL：`http://localhost:8080`

如此即可避免在日常開發中使用 `docker compose build`，更不需要 `--no-cache`。

---

## 1) 在 Docker 啟動資料庫
專案中已提供 `docker-compose.yml`，其中包含 `db` 服務。只啟動資料庫即可：

```bash
docker compose up -d db
```

- 連接埠：5432（映射到本機）
- 資料會透過 Docker volume 持久化（詳見 `docker-compose.yml`）

若需要停止容器但保留資料：
```bash
docker compose stop db
```
若需要清空 DB（注意：會刪除資料）：
```bash
docker compose down -v
```

---

## 2) 在本機執行後端（Spring Boot）
於 `backend/` 目錄執行：

```bash
./mvnw spring-boot:run
```

或使用你的 IDE（如 IntelliJ IDEA）直接執行。後端預設已設定連線至本機的資料庫：

- JDBC URL：`jdbc:postgresql://localhost:5432/appdb`
- 使用者：`appuser`
- 密碼：`apppass`

以上設定與 `application.yml` 及 `docker-compose.yml` 相互一致。

### 資料庫版本管理（Migrations）
專案使用 Flyway，後端啟動時會自動執行 `backend/src/main/resources/db/migration` 底下的所有遷移腳本。

### （可選）使用 Spring DevTools 加速重載
若希望在程式碼修改後能更快重啟，請在 `backend/pom.xml` 新增 Spring Boot DevTools：

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-devtools</artifactId>
  <scope>runtime</scope>
  <optional>true</optional>
</dependency>
```

IntelliJ IDEA 建議設定：
- 開啟「Build project automatically」
- 於「Advanced Settings」啟用「Rebuild project on frame deactivation」（或使用熱鍵手動 Build）

這樣可在修改程式碼時快速觸發後端重啟，提升迭代速度。

---

## 3) 在本機執行前端（Next.js + pnpm）
於 `frontend/` 目錄執行：

```bash
pnpm install
pnpm dev
```

請確認前端能正確呼叫後端 API。建立或更新 `frontend/.env.local`：

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

開發伺服器啟動後，即可享有熱重載（Hot Reload）。大多數 UI 或前端邏輯變更通常能在一秒內反映。

---

## 4) 日常開發流程
- 修改後端程式碼 → 建議搭配 DevTools 或以 `spring-boot:run` 快速重啟
- 修改前端程式碼 → 透過 `pnpm dev` 立即熱重載
- 調整 DB 結構 → 新增/修改 Flyway 遷移檔，後端啟動時自動套用
- 日常開發不需要重建任何 Docker 映像

---

## 5) 常用指令
- 查看 DB 日誌：
```bash
docker compose logs -f db
```
- 重啟 DB 容器：
```bash
docker compose restart db
```
- 使用 psql 連線至 Postgres：
```bash
psql postgresql://appuser:apppass@localhost:5432/appdb
```

---

## 6) 什麼時候需要重建 Docker 映像？
通常僅在「正式發行」或「需要全容器化（例如模擬正式環境的整合測試）」時才需要重建映像。日常開發請避免這麼做，以免拖慢速度。

若確實需要重建前端映像，請避免使用 `--no-cache`，以保留層級快取（例如 `pnpm install` 的快取），加速建置。

---

## 7) 疑難排解
- 5432 連接埠被占用：請停止本機既有的 Postgres，或在 `docker-compose.yml` 調整對外映射連接埠。
- 後端無法連上 DB：確認 DB 容器已啟動（`docker compose ps`），並檢查 `application.yml` 的連線設定是否一致。
- CORS/認證問題：此模式下，前端會呼叫 `http://localhost:8080`；Cookie 與授權標頭可如設計運作，若有 CSRF 設定請一併檢查。
- 前端環境變數未生效：請確認放在 `frontend/.env.local`，並在必要時重啟 `pnpm dev`。

---

## 8) 重點回顧
- 只啟動 DB：`docker compose up -d db`
- 後端本機執行：`./mvnw spring-boot:run`
- 前端本機執行：`pnpm dev`
- 設定 API URL：於 `frontend/.env.local` 設定 `NEXT_PUBLIC_API_BASE_URL=http://localhost:8080`
- Flyway 在後端啟動時自動套用資料庫遷移

採用此流程，你可以在前端、後端與資料庫之間快速迭代，而無需等待緩慢的映像重建。



啟動資料庫（Docker）
• 先確保你的 Docker Desktop 有在跑
• 在專案根目錄執行：
• docker compose up -d db
• 驗證：docker compose ps 應該看到 db 容器在 Up，Postgres 會聽 5432

跑後端（Spring Boot，本機）
• 進到 backend 目錄：
• ./mvnw spring-boot:run
• 預設會連到本機的 Postgres：
• jdbc:postgresql://localhost:5432/appdb
• appuser / apppass
• 第一次跑會自動套用 Flyway migrations

跑前端（Next.js，本機）
• 進到 frontend 目錄：
• pnpm install
• 建立或確認 frontend/.env.local 內容：
• NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
• pnpm dev
• 瀏覽器打開 http://localhost:3000

開發迭代
• 改後端程式：spring-boot:run 會重啟；如要更快可加 Spring DevTools
• 改前端：pnpm dev 會 hot reload
• 改 DB 結構：新增 Flyway 檔，重啟後端會自動套用

常用指令
• 看 DB 日誌：docker compose logs -f db
• 重啟 DB 容器：docker compose restart db
• 清空 DB（會刪資料）：docker compose down -v
