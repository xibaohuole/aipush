#!/bin/bash
# 清理指定端口的脚本（适用于Git Bash和WSL）
# 用法: ./kill-port.sh [端口号]
# 示例: ./kill-port.sh 4000

if [ -z "$1" ]; then
    echo "错误：请提供端口号"
    echo "用法: ./kill-port.sh [端口号]"
    echo "示例: ./kill-port.sh 4000"
    exit 1
fi

PORT=$1

echo "正在查找占用端口 $PORT 的进程..."

# 检查是否在Windows环境（Git Bash）
if command -v taskkill.exe &> /dev/null; then
    # Windows (Git Bash)
    PIDS=$(netstat -ano | grep ":$PORT" | awk '{print $5}' | sort -u)

    if [ -z "$PIDS" ]; then
        echo "端口 $PORT 未被占用"
        exit 0
    fi

    for PID in $PIDS; do
        if [ "$PID" != "0" ] && [ ! -z "$PID" ]; then
            echo "找到进程 PID: $PID"
            taskkill.exe //F //PID $PID
            if [ $? -eq 0 ]; then
                echo "成功终止进程 $PID"
            else
                echo "终止进程 $PID 失败"
            fi
        fi
    done
else
    # Linux/WSL
    PIDS=$(lsof -ti:$PORT)

    if [ -z "$PIDS" ]; then
        echo "端口 $PORT 未被占用"
        exit 0
    fi

    for PID in $PIDS; do
        echo "找到进程 PID: $PID"
        kill -9 $PID
        if [ $? -eq 0 ]; then
            echo "成功终止进程 $PID"
        else
            echo "终止进程 $PID 失败"
        fi
    done
fi

echo ""
echo "端口 $PORT 清理完成！"
