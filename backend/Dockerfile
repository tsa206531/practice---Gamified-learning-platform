# --- 第一階段：建置階段 (Build Stage) ---
# 使用包含 Maven 和 JDK 17 的映像檔來編譯和打包 Spring Boot 應用程式
FROM maven:3.9-eclipse-temurin-21 AS build

# 設定工作目錄
WORKDIR /app

# 複製 pom.xml 並下載依賴
# 這樣可以利用 Docker 的快取機制，只有在 pom.xml 變動時才重新下載依賴
COPY pom.xml .
# 增強穩定性：批次模式、更新快取、HTTP 重試，並在失敗時重試一次
RUN mvn -B -U -DskipTests \
    -Dmaven.wagon.http.retryHandler.count=3 \
    -Dhttp.keepAlive=false \
    dependency:go-offline || (sleep 5 && mvn -B -U -DskipTests -Dmaven.wagon.http.retryHandler.count=3 -Dhttp.keepAlive=false dependency:go-offline)

# 複製所有專案原始碼
COPY src ./src

# 執行打包命令，並強制 repackage 產生可執行的 fat jar
# -DskipTests 會跳過測試，加快建置速度
RUN mvn package -DskipTests

# --- 第二階段：運行階段 (Runtime Stage) ---
# 使用一個輕量級的 JRE 映像檔來運行應用程式
FROM eclipse-temurin:21-jre-jammy

WORKDIR /app

# 從建置階段複製打包好的 jar 檔案
COPY --from=build /app/target/*.jar app.jar

# 開放 8080 port (Spring Boot 預設 port)
EXPOSE 8080

# 啟動應用程式的指令
ENTRYPOINT ["java", "-jar", "app.jar"]