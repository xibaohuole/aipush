@echo off
chcp 65001 >nul
cls
echo ========================================
echo   AI Pulse Daily - 新闻统计查询
echo ========================================
echo.

:: 检查是否提供了 API URL
if "%1"=="" (
    echo ❌ 错误：请提供 API URL
    echo.
    echo 使用方法：
    echo   check-news-stats.bat https://your-api.onrender.com
    echo.
    pause
    exit /b 1
)

set API_URL=%1

echo 📡 目标 API: %API_URL%
echo.
echo ⏳ 正在获取统计信息...
echo.

:: 获取统计
curl "%API_URL%/api/news/scraper/stats"

echo.
echo.
echo ✅ 统计信息已显示！
echo.
pause
