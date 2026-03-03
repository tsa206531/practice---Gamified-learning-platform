後端 IDE 故障排除 (Spring 引入無法解析)
問題

IDE 顯示錯誤，類似於：「The import org.springframework cannot be resolved」，發生在 backend/src/main/java/com/example/learningplatform/Application.java 中。

在這個專案中，Application.java 是標準的 Spring Boot 應用程式，且 backend/pom.xml 正確地管理 Spring Boot 依賴項。backend/target/ 中有一個已構建的 JAR 檔案，這表明專案能在正確的環境下構建。

根本原因通常是本地環境配置問題（IDE/JDK/Maven 索引），而非代碼本身。

檢查清單（先做這些）

使用 JDK 21（而非 JRE）

java -version 顯示應該是 21.x 版本。

使用 Maven 導入後端專案

使用 backend/pom.xml 導入（不要只打開文件夾）。

在 IDE 中刷新 Maven 依賴並重建索引。

確保 backend/src/main/java 目錄已標記為「源代碼根目錄」。

IntelliJ IDEA 步驟

使用 Maven 導入

點選「檔案 > 新建 > 從現有來源建立專案」> 選擇 backend/pom.xml。

設置 JDK 21

點選「檔案 > 專案結構 > 專案 SDK」選擇 JDK 21。

「專案語言級別」設為 21。

刷新依賴

在 Maven 工具視窗（右側）點選「重新加載所有 Maven 專案」。

重建索引（如果仍然報錯）

點選「檔案 > 使無效的快取/重新啟動」> 點選「使無效並重新啟動」。

標記源目錄（如果需要）

右鍵點選 backend/src/main/java > 「標記為 > 源根目錄」。

Eclipse 步驟

使用 Maven 導入

點選「檔案 > 導入 > 現有 Maven 專案」> 選擇 backend。

設置 JDK 21

點選「視窗 > 偏好設定 > Java > 已安裝的 JRE」確保 JDK 21 已經被添加並選中。

在「專案 > 屬性 > Java 建立路徑」中，確保 JRE 系統庫是 JavaSE-21。

刷新依賴

右鍵點選專案 > 「Maven > 更新專案」…（勾選強制更新快照/釋放版本）。

清理專案

點選「專案 > 清理」。

##VS Code 步驟

安裝 Java 工具

安裝「Extension Pack for Java」。

設置 JDK 21

配置 java.configuration.runtimes 指向 JDK 21。

打開 Maven 專案

打開 backend/pom.xml，這樣 Java 擴展可以解析依賴。

清理 Java 工作區

打開命令面板 > 「Java: Clean Java Language Server Workspace」。

可選: Maven Wrapper（如果本地缺少 Maven）

IDE 可以管理沒有全域安裝的 Maven，但添加 Maven Wrapper（mvnw）有助於保持構建一致性：

生成專案本地的 mvnw 腳本和 /.mvn 文件夾，這樣像 ./mvnw -f backend/pom.xml clean package 這樣的命令可以在沒有全域 Maven 的情況下運行。

為何這不是代碼問題

Application.java 使用的是標準的 Spring Boot 引入和註解。

pom.xml 引入了 spring-boot-dependencies 且包括了所需的 starter 依賴。

在 backend/target/ 中有一個先前成功構建的 JAR 檔案（learning-platform-0.0.1-SNAPSHOT.jar）。

修復後的驗證

IDE 停止顯示 Spring 引入的紅色下劃線錯誤。

Maven 導入樹顯示 Spring Boot 依賴已解析。

執行構建：

從 IDE 運行 Maven 生命週期（clean/package）來構建 backend。

或在終端中執行：mvn -f backend/pom.xml -U clean package（如果有 Wrapper 則用 ./mvnw）。

如果問題仍然存在

確保企業/網路代理未阻止 Maven Central。

嘗試刪除 IDE 快取並重新導入專案。

檢查 IDE 中是否只有一個 Java 版本被激活（沒有混合工具鏈）。

檢查 backend/pom.xml 是否有誤修改。

更新時間：YYYY-MM-DD