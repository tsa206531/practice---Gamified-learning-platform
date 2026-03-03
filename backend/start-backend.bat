@echo off
echo Setting up environment variables for backend...

set "GOOGLE_CLIENT_ID=535884289758-3nl70gvlq22hbtmp2rhadd53dlmq5hm4.apps.googleusercontent.com"
set "GOOGLE_CLIENT_SECRET=your-google-client-secret-here"
set "APP_JWT_SECRET=change-me-please-change-me-please-change-me"
set "SPRING_DATASOURCE_PASSWORD=apppass"

echo Starting Spring Boot application...
call mvnw spring-boot:run
