@echo off
REM 清理指定端口的脚本
REM 用法: kill-port.bat [端口号]
REM 示例: kill-port.bat 4000

setlocal enabledelayedexpansion

if "%1"=="" (
    echo 错误：请提供端口号
    echo 用法: kill-port.bat [端口号]
    echo 示例: kill-port.bat 4000
    exit /b 1
)

set PORT=%1

echo 正在查找占用端口 %PORT% 的进程...

REM 使用netstat查找端口占用情况
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%PORT%"') do (
    set PID=%%a
    if not "!PID!"=="" (
        if not "!PID!"=="0" (
            echo 找到进程 PID: !PID!
            taskkill /F /PID !PID!
            if !errorlevel! equ 0 (
                echo 成功终止进程 !PID!
            ) else (
                echo 终止进程 !PID! 失败
            )
        )
    )
)

echo.
echo 端口 %PORT% 清理完成！
timeout /t 2 >nul
