# 偵錯日誌：2025年11月24日 - Google 登入與個人資料頁面問題

本文檔記錄了從後端啟動失敗到成功實現 Google 登入並顯示個人資料頁面的完整偵錯過程。

## 初始問題：後端 Spring Boot 服務啟動失敗

*   **現象**：執行後端啟動腳本時，應用程式在啟動過程中拋出錯誤並終止。
*   **錯誤日誌**：`Unresolved compilation problems: javax.servlet cannot be resolved to a variable`。
*   **根本原因**：專案使用的 Spring Boot 3.x 版本，其底層依賴已從舊的 Java EE (`javax.*` 命名空間) 遷移至 Jakarta EE (`jakarta.*` 命名空間)。然而，`SecurityConfig.java` 檔案中仍然使用了舊的 `import javax.servlet.*` 語句。
*   **解決方案**：將 `SecurityConfig.java` 中所有 `javax.servlet` 的 import 語句替換為 `jakarta.servlet`。

---

## 第二階段：前端 Google 登入按鈕消失

*   **現象**：在登入頁面 `http://localhost:3000/auth/login`，預期的「使用 Google 登入」按鈕沒有顯示。
*   **根本原因**：前端主佈局檔案 `frontend/app/layout.tsx` 中，缺少了載入 Google Identity Services (GSI) 客戶端腳本的 `<Script>` 標籤。沒有這個腳本，瀏覽器無法初始化和渲染 Google 登入按鈕。
*   **解決方案**：在 `layout.tsx` 的 `<body>` 標籤內，加入以下程式碼：
    ```typescript
    import Script from 'next/script'
    // ...
    <Script src="https://accounts.google.com/gsi/client" async defer />
    ```

---

## 第三階段：後端處理 Google 登入時崩潰

*   **現象**：點擊 Google 登入按鈕並完成授權後，後端服務崩潰。瀏覽器開發者工具顯示對 `/api/auth/google` 的請求回應為 `failed to load response data`。
*   **錯誤日誌**：`Unresolved compilation problem: avatar cannot be resolved to a variable` 以及 `provider cannot be resolved or is not a field`。
*   **根本原因**：後端程式碼（如 `AuthController`）在處理登入邏輯時，試圖存取 `User` 實體物件的 `avatar` 和 `provider` 欄位，但 `User.java` 類別中並未宣告這些欄位。
*   **解決方案**：編輯 `backend/src/main/java/com/example/learningplatform/user/User.java` 檔案，加入 `provider`、`providerId` 和 `avatar` 欄位的宣告及對應的 `@Column` 註解。

---

## 第四階段：資料庫與程式碼不同步導致的啟動失敗

*   **現象**：即使 `User.java` 和 Flyway 遷移腳本 (`V7__...sql`) 都已正確，後端服務在啟動時仍然失敗。
*   **根本原因**：這是一個「雞生蛋，蛋生雞」的死循環問題。
    1.  `application.yml` 中的設定 `spring.jpa.hibernate.ddl-auto: validate` 要求 Hibernate 在啟動時嚴格驗證 Java 實體與資料庫表格結構是否一致。
    2.  Hibernate 發現 `User.java` 比資料庫多了幾個欄位，驗證失敗，導致應用程式啟動失敗。
    3.  應用程式在 Flyway 有機會執行 `V7` 遷移腳本來更新資料庫**之前**就已經崩潰了。
*   **解決方案**：
    1.  **暫時修改**：將 `application.yml` 中的 `ddl-auto: validate` 暫時改為 `ddl-auto: update`。這個設定會讓 Hibernate 在發現不一致時，自動嘗試更新資料庫結構，從而繞過啟動失敗的問題。
    2.  **重啟後端**：執行 `start-backend.bat`。這次後端會成功啟動，Flyway 也會將 `V7` 腳本標記為已執行，資料庫結構完成同步。
    3.  **恢復設定**：後端成功啟動一次後，將其關閉，並**務必**將 `ddl-auto: update` **改回** `ddl-auto: validate`，以恢復對資料庫結構的嚴格保護。

---

## 最終階段：個人資料頁面顯示 `Unauthorized`

*   **現象**：成功登入並跳轉到 `/profile` 頁面後，頁面顯示 `Unauthorized` 錯誤。
*   **錯誤日誌**：後端日誌顯示 `java.lang.NullPointerException`，發生在 `UserController.java` 的 `getMe` 方法第 28 行。
*   **根本原因**：`getMe` 方法中使用了 `Map.of(...)` 來建構回傳給前端的 JSON 物件。`Map.of()` 方法不允許任何 `null` 值。當一個新使用者透過 Google 註冊時，其 `occupation`、`birthday` 等欄位在資料庫中預設為 `NULL`。當程式試圖將這些 `null` 值放入 `Map.of()` 時，便觸發了 `NullPointerException`，導致後端處理請求失敗。
*   **解決方案**：修改 `UserController.java`，將 `getMe` 和 `updateMe` 方法中建立回應物件的方式，從 `Map.of()` 改為使用允許 `null` 值的 `new HashMap<>()`。

---

## 總結

本次偵錯涵蓋了從後端環境設定、前端腳本載入、資料庫遷移管理到後端業務邏輯的完整流程。核心問題圍繞著**狀態同步**展開：

1.  **開發環境同步**：`javax` vs `jakarta` 的命名空間遷移。
2.  **程式碼與資料庫同步**：`User.java` 實體與資料庫表格結構的一致性，透過 Flyway 和 `ddl-auto` 策略來管理。
3.  **業務邏輯健壯性**：處理好 `null` 值的邊界情況，避免使用對 `null` 不友善的 API（如 `Map.of()`）處理可能為空的資料庫欄位。

透過系統性的檢查（觀察後端日誌、使用瀏覽器開發者工具 Network 面板），最終定位並解決了所有問題。