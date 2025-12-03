#!/bin/bash

# 新闻采集触发脚本
# 使用方法：bash trigger-scraping.sh <你的API域名>

API_URL="${1:-https://aipush-api.onrender.com}"

echo "🚀 正在触发新闻采集..."
echo "📍 API地址: $API_URL"
echo ""

# 检查服务是否可用
echo "1️⃣ 检查服务健康状态..."
HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/api/health")

if [ "$HEALTH_STATUS" != "200" ]; then
  echo "❌ 服务不可用 (HTTP $HEALTH_STATUS)"
  echo "请检查Render部署状态"
  exit 1
fi

echo "✅ 服务运行正常"
echo ""

# 触发采集
echo "2️⃣ 触发新闻采集任务..."
RESPONSE=$(curl -X POST "$API_URL/api/news/scraper/trigger" \
  -H "Content-Type: application/json" \
  -w "\n%{http_code}" \
  -s)

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ 采集任务已启动"
  echo ""
  echo "📊 采集结果："
  echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
  echo ""

  # 提取统计信息
  TOTAL=$(echo "$BODY" | jq -r '.total // "N/A"' 2>/dev/null)
  NEW=$(echo "$BODY" | jq -r '.new // "N/A"' 2>/dev/null)
  DUPLICATE=$(echo "$BODY" | jq -r '.duplicate // "N/A"' 2>/dev/null)
  FAILED=$(echo "$BODY" | jq -r '.failed // "N/A"' 2>/dev/null)

  echo "📈 统计信息："
  echo "  总处理: $TOTAL 条"
  echo "  新增: $NEW 条"
  echo "  重复: $DUPLICATE 条"
  echo "  失败: $FAILED 条"
else
  echo "❌ 采集失败 (HTTP $HTTP_CODE)"
  echo "错误信息: $BODY"
  exit 1
fi

echo ""
echo "3️⃣ 查看采集统计..."
STATS=$(curl -s "$API_URL/api/news/scraper/stats")
echo "$STATS" | jq '.' 2>/dev/null || echo "$STATS"

echo ""
echo "✅ 全部完成！"
echo "💡 提示: 可以访问 $API_URL/api/docs 查看Swagger文档"
