@echo off
chcp 65001 >nul
cls
echo ========================================
echo   AI Pulse Daily - 新闻采集触发器
echo ========================================
echo.

:: 检查是否提供了 API URL
if "%1"=="" (
    echo ❌ 错误：请提供 API URL
    echo.
    echo 使用方法：
    echo   trigger-news-collection.bat https://your-api.onrender.com
    echo.
    pause
    exit /b 1
)

set API_URL=%1

echo 📡 目标 API: %API_URL%
echo.
echo ⏳ 正在触发新闻采集...
echo.

:: 触发采集
curl -X POST "%API_URL%/api/news/scraper/trigger"

echo.
echo.
echo ✅ 采集任务已触发！
echo.
echo 📊 查看采集状态：
echo   curl %API_URL%/api/news/scraper/status
echo.
echo 📈 查看采集统计：
echo   curl %API_URL%/api/news/scraper/stats
echo.
echo ⏰ 采集预计需要 10-20 分钟完成
echo    （取决于 GLM API 速度和新闻数量）
echo.
pause
