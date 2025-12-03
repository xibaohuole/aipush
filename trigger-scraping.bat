@echo off
chcp 65001 >nul
setlocal

:: 新闻采集触发脚本（Windows版本）
:: 使用方法：trigger-scraping.bat [你的API域名]

set "API_URL=%~1"
if "%API_URL%"=="" set "API_URL=https://aipush-api.onrender.com"

echo 🚀 正在触发新闻采集...
echo 📍 API地址: %API_URL%
echo.

:: 检查服务健康状态
echo 1️⃣ 检查服务健康状态...
curl -s -o nul -w "%%{http_code}" "%API_URL%/api/health" > temp_status.txt
set /p HEALTH_STATUS=<temp_status.txt
del temp_status.txt

if not "%HEALTH_STATUS%"=="200" (
    echo ❌ 服务不可用 ^(HTTP %HEALTH_STATUS%^)
    echo 请检查Render部署状态
    pause
    exit /b 1
)

echo ✅ 服务运行正常
echo.

:: 触发采集任务
echo 2️⃣ 触发新闻采集任务...
curl -X POST "%API_URL%/api/news/scraper/trigger" ^
     -H "Content-Type: application/json" ^
     -s > scrape_result.json

echo ✅ 采集任务已完成
echo.
echo 📊 采集结果：
type scrape_result.json
echo.

:: 查看统计信息
echo 3️⃣ 查看采集统计...
curl -s "%API_URL%/api/news/scraper/stats" > stats_result.json
type stats_result.json
echo.

:: 清理临时文件
del scrape_result.json
del stats_result.json

echo.
echo ✅ 全部完成！
echo 💡 提示: 可以访问 %API_URL%/api/docs 查看Swagger文档
echo.
pause
