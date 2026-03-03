# Docker 建置與執行階段除錯日誌 - 2025/11/19

本文檔記錄了在建置和執行 Next.js + Spring Boot 專案時遇到的一系列問題及其解決過程。

---

## 問題一：Next.js 前端建置失敗 (TypeScript 型別錯誤)

### 初始錯誤

在執行 `docker-compose build` 時，前端服務建置失敗，出現以下 TypeScript 型別錯誤：

```
Type error: Property 'get' does not exist on type 'Promise<ReadonlyRequestCookies>'.

   7 | export async function GET() {
   8 |   const cookieStore = cookies()
 > 9 |   const token = cookieStore.get('token')?.value
     |                             ^
```

這個錯誤最初在 `app/api/auth/me/route.ts` 和 `app/api/admin/metrics/route.ts` 中都出現了。

### 問題分析

錯誤訊息表明，`cookieStore` 變數的型別被推斷為 `Promise<ReadonlyRequestCookies>`，而不是一個可以直接呼叫 `.get()` 方法的物件。這意味著 `cookies()` 函數在當前專案使用的 Next.js 版本中是一個**非同步**函數，它會回傳一個 Promise。

### 解決方案

必須使用 `await` 關鍵字來等待 Promise 解析完成，然後才能在其回傳的物件上呼叫 `.get()` 方法。

**修正前：**
```typescript
const token = cookieStore.get('token')?.value
```

**修正後：**
```typescript
const token = (await cookieStore).get('token')?.value
```

這個修復需要應用於所有使用到 `cookies()` 函數的檔案，包括 `app/api/auth/me/route.ts` 和 `app/api/admin/metrics/route.ts`。

---

## 問題二：Docker Compose 指令錯誤

### 錯誤訊息
在嘗試使用 `docker-compose up --build --no-cache -d` 指令時，出現錯誤：
```
unknown flag: --no-cache
```

### 解決方案
`--no-cache` 參數屬於 `build` 指令，而不是 `up` 指令。正確的指令順序是先強制重新建置，然後再啟動容器。

1.  **強制重新建置 (不使用快取):**
    ```bash
    docker-compose build --no-cache
    ```
2.  **啟動服務:**
    ```bash
    docker-compose up -d
    ```

---

## 問題三：前端容器啟動後無法存取，執行階段錯誤

### 狀況描述
容器成功啟動 (`frontend Started`)，但在瀏覽器中開啟 `http://localhost:3000` 卻沒有畫面。

### 錯誤訊息
檢查 Docker Desktop 中的前端容器日誌，發現以下錯誤：
```
Error: Cannot find module '/app/pnpm'

    at Module._resolveFilename (node:internal/modules/cjs/loader:1207:15)
    ...
```

### 問題分析
這個錯誤表示在容器內部執行啟動指令 (根據 `README.md` 應為 `pnpm start`) 時，Node.js 環境找不到 `pnpm` 這個執行檔。這通常是 `frontend/Dockerfile` 的問題，可能的原因包括：
1.  在最終的執行階段 (runtime stage) 沒有安裝 `pnpm`。
2.  `pnpm` 安裝了，但其路徑沒有被包含在系統的 `PATH` 環境變數中。

這是一個建置映像檔過程中的疏漏，需要在 `frontend/Dockerfile` 中修復。

---

## 2025/11/20 紀錄：Docker 啟動後端與前端問題與修復

### 問題四：後端 Spring Boot jar 無法執行（no main manifest attribute）

- 現象：容器啟動時，Java 報錯 `no main manifest attribute, in /app/app.jar`。
- 成因：在 Docker build 過程中複製到了 `*.jar.original`（非可執行 jar），或 Maven 未執行 `spring-boot:repackage` 產生可執行 fat jar。
- 修復：
  - 在 `backend/Dockerfile` 的 build 階段強制 repackage 並挑出非 `.original` 的 jar：
    ```dockerfile
    RUN mvn -q -DskipTests package spring-boot:repackage \
        && ls -l target \
        && cp target/*-SNAPSHOT.jar target/app.jar \
        && rm -f target/*.original
    ```
  - 在 run 階段明確複製：
    ```dockerfile
    COPY --from=build /app/target/app.jar app.jar
    ```
  - 在 `backend/pom.xml` 綁定 repackage 至 `package` 階段，提高穩定性：
    ```xml
    <execution>
      <phase>package</phase>
      <goals>
        <goal>repackage</goal>
      </goals>
    </execution>
    ```

### 問題五：後端啟動循環相依（JwtAuthFilter ↔ SecurityConfig）

- 現象：Spring Boot 啟動失敗，日誌顯示循環相依：
  - `jwtAuthFilter` ↔ `securityConfig.jwtAuthFilter`
- 成因：`SecurityConfig` 以欄位注入 `JwtAuthFilter`，同時 `JwtAuthFilter` 又依賴到由 `SecurityConfig` 產出的 beans，導致循環。Spring Boot 3 預設禁止循環相依。
- 修復：移除 `SecurityConfig` 中的欄位注入，改為在 `securityFilterChain` 方法參數注入：
  ```java
  // 移除：
  // @Autowired
  // private JwtAuthFilter jwtAuthFilter;

  // 改為：
  @Bean
  public SecurityFilterChain securityFilterChain(HttpSecurity http, JwtAuthFilter jwtAuthFilter) throws Exception {
      // ...
  }
  ```

### 問題六：前端容器啟動 `Cannot find module '/app/pnpm'`

- 成因：容器預設 entrypoint 讓 `CMD ["pnpm","start"]` 被當作提供給 node 的參數，Node 試圖執行 `/app/pnpm` 而失敗；且 build 階段未 `pnpm build`，導致 `.next` 可能不存在。
- 修復：
  - 在 `frontend/Dockerfile` build 階段加入建置：
    ```dockerfile
    RUN corepack enable && corepack prepare pnpm@latest --activate \
        && pnpm build
    ```
  - 在 run 階段以 shell 呼叫，避免被 node 誤解：
    ```dockerfile
    CMD ["sh","-lc","pnpm start"]
    ```

### 驗證步驟

1. 重新建置與啟動：
   ```bash
   docker-compose up --build
   ```
2. 檢查服務：
   - 前端：http://localhost:3000
   - 後端健康檢查：http://localhost:8080/api/health
3. 觀察日誌：
   ```bash
   docker-compose logs -f backend
   docker-compose logs -f frontend
   ```

### 備註
- 若仍看到後端 manifest 錯誤，請先執行：
  ```bash
  docker-compose build --no-cache backend
  ```
  確認 build 階段輸出了 `ls -l target`，且 `target/app.jar` 已建立。

---

## 2025/11/20 紀錄：Flyway 升級與 PostgreSQL 16 相容性處理流程

### 背景
- 啟動後端時，Spring Boot 在 `FlywayAutoConfiguration` 初始化階段失敗，錯誤訊息：`Unsupported Database: PostgreSQL 16.11`。
- 代表當前 Flyway 對 PG 16.11 的識別或相容性不足。

### 採用的解決方案（選項 A）
1) 在 `backend/pom.xml` 加入 PostgreSQL 專用適配器：
   ```xml
   <dependency>
     <groupId>org.flywaydb</groupId>
     <artifactId>flyway-database-postgresql</artifactId>
     <version>${flyway.version}</version>
     <scope>runtime</scope>
   </dependency>
   ```
2) 明確指定並升級 Flyway 版本，確保支援 PG16：
   ```xml
   <properties>
     <flyway.version>10.22.0</flyway.version>
   </properties>

   <dependency>
     <groupId>org.flywaydb</groupId>
     <artifactId>flyway-core</artifactId>
     <version>${flyway.version}</version>
   </dependency>
   <dependency>
     <groupId>org.flywaydb</groupId>
     <artifactId>flyway-database-postgresql</artifactId>
     <version>${flyway.version}</version>
     <scope>runtime</scope>
   </dependency>
   ```

### 驗證步驟
1) 強制重建 Backend（避免 Maven/Docker 快取）：
   ```bash
   docker-compose build --no-cache backend
   ```
2) 啟動 Backend 並觀察日誌：
   ```bash
   docker-compose up backend
   ```
3) 確認 Flyway migration 正常執行完畢，Application 啟動完成。

### 替代方案（若仍遇到相容性問題）
- 暫時停用 Flyway（僅在 docker profile）：於 `application-docker.yml` 設定 `spring.flyway.enabled=false`。
- 將 Postgres 降版至 `postgres:15` 以快速繞過 PG16 相容性問題。
- 拉更高版本的 Flyway（例如 10.23.x 之後版本）再測試。

---

## 2025/11/20 紀錄：選項 B - 在 Docker 環境暫停 Flyway（先讓服務啟動）

### 目的
- 在 PostgreSQL 16.11 的相容性未完全確認前，先讓應用服務啟動，避免 Flyway 初始阻塞 JPA/EntityManagerFactory。

### 作法
- 新增 `backend/src/main/resources/application-docker.yml` 並設定：
  ```yaml
  spring:
    flyway:
      enabled: false
  ```
- 使用 `SPRING_PROFILES_ACTIVE=docker`（compose 已設）讓此設定在容器中生效。

### 驗證步驟
1) 強制重建 Backend（避免快取）：
   ```bash
   docker-compose build --no-cache backend
   ```
2) 啟動 Backend：
   ```bash
   docker-compose up backend
   ```
3) 確認 Tomcat 啟動且 API 可回應（例如 `/api/health`）。

### 後續
- 待 Flyway 與 PG16 相容性確認後，移除 `application-docker.yml` 裡的 `spring.flyway.enabled=false`，恢復 migration。

## 2025/11/20 紀錄：選項 C - 降版資料庫至 Postgres 15（短期 workaround）

### 目的
- 在 PG16 與 Flyway 相容性未解決前，先以 Postgres 15 確保後端服務能成功啟動與驗證其他功能。

### 作法
- 修改 `docker-compose.yml`：
  ```diff
  - image: postgres:16
  + image: postgres:15
  ```

### 驗證步驟
1) 重新建置 DB 與 Backend（避免快取殘留）：
   ```bash
   docker-compose build --no-cache db backend
   ```
2) 啟動 DB 與 Backend：
   ```bash
   docker-compose up db backend
   ```
3) 確認 Backend 正常啟動並可連線 DB，API `/api/health` 可回應。

### 後續
- 當 Flyway 對 PG16 的相容性方案確定後，恢復為 `postgres:16` 並移除 workaround。
- 可搭配選項 A（升級 Flyway）與內部驗證環境確認相容性，再回升版本。


---

## 2025/11/20 紀錄：後端與資料庫啟動失敗全流程除錯

### 背景
在解決了前端建置與後端打包問題後，`docker-compose up` 依然無法成功啟動所有服務。後端與資料庫容器出現了一系列環環相扣的錯誤。

### 第一階段：資料庫版本不相容

- **現象**：`postgres` 容器啟動失敗，日誌顯示 `FATAL: database files are incompatible with server`，指出資料目錄由 PostgreSQL 16 初始化，與當前的 v15 不相容。
- **原因**：`docker-compose.yml` 中將 `image` 從 `postgres:16` 降級為 `postgres:15`，但 Docker 的具名磁碟區 `db_data_v15` (之前可能用於 v16) 保留了舊版本的資料檔案。
- **解決方案**：執行 `docker-compose down -v`，使用 `-v` 參數徹底刪除舊的資料庫磁碟區，讓 `postgres:15` 容器能夠建立一個全新的、乾淨的資料庫。

### 第二階段：資料表不存在 (Missing Table)

- **現象**：資料庫正常啟動後，`backend` 服務啟動失敗，日誌顯示 `Schema-validation: missing table [users]`。
- **原因**：在之前的除錯過程中，為了繞過 Flyway 與 PG16 的問題，在 `application-docker.yml` 中設定了 `spring.flyway.enabled: false`。這導致負責建立資料庫結構的 Flyway 沒有運行，資料庫是空的。
- **解決方案**：修改 `application-docker.yml`，將 `spring.flyway.enabled` 設回 `true`，重新啟用資料庫遷移功能。

### 第三階段：資料欄位類型不匹配 (Wrong Column Type)

- **現象**：啟用 Flyway 後，`backend` 服務依然啟動失敗，但錯誤變為 `wrong column type encountered in column [id] in table [users]; found [serial (Types#INTEGER)], but expecting [bigint (Types#BIGINT)]`。
- **原因**：Java 實體類 `User.java` 中的 `id` 屬性為 `Long` 類型，對應資料庫應為 `BIGINT`。但 Flyway 遷移腳本 `V2__users.sql` 中使用了 `SERIAL`，它在 PostgreSQL 中對應的是 `INTEGER`。兩者不匹配導致 Hibernate 驗證失敗。
- **解決方案**：修改 `V2__users.sql`，將 `id` 欄位的類型從 `SERIAL` 改為 `BIGSERIAL`，使其與 `Long` 類型對應的 `BIGINT` 一致。
  ```diff
  -- V2__users.sql
  - id SERIAL PRIMARY KEY,
  + id BIGSERIAL PRIMARY KEY,
  ```

### 最終驗證流程

在完成以上所有修正後，執行以下指令即可成功啟動整個應用：

1.  **停止並徹底清除舊環境** (此步在每次修改 SQL 或遇到資料庫相關問題時都至關重要)：
    ```bash
    docker-compose down -v
    ```
2.  **重新建置映像檔以應用所有變更**：
    ```bash
    docker-compose build
    ```
3.  **啟動所有服務**：
    ```bash
    docker-compose up -d
    ```
