@echo off
REM 性能测试脚本 (Windows)
REM 用法: test-performance.bat https://your-api.onrender.com

setlocal enabledelayedexpansion

if "%1"=="" (
    set API_URL=http://localhost:4000
) else (
    set API_URL=%1
)

echo ================================================
echo 🚀 AI Push 性能测试
echo ================================================
echo API URL: %API_URL%
echo.

echo ================================================
echo 📊 测试 1: 首页加载（首次，无缓存）
echo ================================================
curl -w "响应时间: %%{time_total}s\n" -o nul -s "%API_URL%/api/news?page=1&limit=20"
timeout /t 1 /nobreak >nul

echo.
echo ================================================
echo 📊 测试 2: 首页加载（第二次，有缓存）
echo ================================================
curl -w "响应时间: %%{time_total}s\n" -o nul -s "%API_URL%/api/news?page=1&limit=20"
timeout /t 1 /nobreak >nul

echo.
echo ================================================
echo 📊 测试 3: 搜索查询
echo ================================================
echo 测试: 搜索 - AI
curl -w "响应时间: %%{time_total}s\n" -o nul -s "%API_URL%/api/news?search=AI"
timeout /t 1 /nobreak >nul

echo 测试: 搜索 - machine learning
curl -w "响应时间: %%{time_total}s\n" -o nul -s "%API_URL%/api/news?search=machine+learning"
timeout /t 1 /nobreak >nul

echo.
echo ================================================
echo 📊 测试 4: 分类筛选
echo ================================================
echo 测试: 分类 - research
curl -w "响应时间: %%{time_total}s\n" -o nul -s "%API_URL%/api/news?category=research&page=1&limit=20"
timeout /t 1 /nobreak >nul

echo 测试: 分类 - product
curl -w "响应时间: %%{time_total}s\n" -o nul -s "%API_URL%/api/news?category=product&page=1&limit=20"
timeout /t 1 /nobreak >nul

echo.
echo ================================================
echo 📊 测试 5: 缓存统计
echo ================================================
echo 获取缓存统计...
curl -s "%API_URL%/api/news/cache/stats"
echo.

echo.
echo ================================================
echo 🎯 性能基准
echo ================================================
echo ✅ 优秀: ^< 0.1s
echo ⚠️  良好: 0.1-0.2s
echo ❌ 需优化: ^> 0.2s
echo.
echo 预期目标:
echo - 首页缓存加载: ^< 0.1s
echo - 搜索查询: ^< 0.15s
echo - 分类/地区筛选: ^< 0.15s
echo - 缓存命中率: ^> 80%%
echo.
echo ================================================
echo ✨ 测试完成！
echo ================================================

pause
