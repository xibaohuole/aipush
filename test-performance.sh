#!/bin/bash

# 性能测试脚本
# 用法: ./test-performance.sh https://your-api.onrender.com

API_URL="${1:-http://localhost:4000}"

echo "================================================"
echo "🚀 AI Push 性能测试"
echo "================================================"
echo "API URL: $API_URL"
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 测试函数
test_endpoint() {
    local name="$1"
    local url="$2"
    local expected_max="$3"

    echo -n "测试: $name ... "

    # 执行请求并获取响应时间
    response_time=$(curl -w "%{time_total}" -o /dev/null -s "$url")

    # 转换为毫秒
    time_ms=$(echo "$response_time * 1000" | bc)
    time_ms_int=${time_ms%.*}

    # 判断是否通过
    if (( time_ms_int < expected_max )); then
        echo -e "${GREEN}✅ PASS${NC} (${time_ms_int}ms < ${expected_max}ms)"
        return 0
    else
        echo -e "${RED}❌ FAIL${NC} (${time_ms_int}ms > ${expected_max}ms)"
        return 1
    fi
}

echo "================================================"
echo "📊 测试 1: 首页加载（首次，无缓存）"
echo "================================================"
test_endpoint "首页首次加载" "$API_URL/api/news?page=1&limit=20" 500
sleep 1

echo ""
echo "================================================"
echo "📊 测试 2: 首页加载（第二次，有缓存）"
echo "================================================"
test_endpoint "首页缓存加载" "$API_URL/api/news?page=1&limit=20" 150
sleep 1

echo ""
echo "================================================"
echo "📊 测试 3: 搜索查询"
echo "================================================"
test_endpoint "搜索 - AI" "$API_URL/api/news?search=AI" 300
sleep 1
test_endpoint "搜索 - machine learning" "$API_URL/api/news?search=machine+learning" 300
sleep 1

echo ""
echo "================================================"
echo "📊 测试 4: 分类筛选"
echo "================================================"
test_endpoint "分类 - research" "$API_URL/api/news?category=research&page=1&limit=20" 200
sleep 1
test_endpoint "分类 - product" "$API_URL/api/news?category=product&page=1&limit=20" 200
sleep 1

echo ""
echo "================================================"
echo "📊 测试 5: 地区筛选"
echo "================================================"
test_endpoint "地区 - north_america" "$API_URL/api/news?region=north_america&page=1&limit=20" 200
sleep 1
test_endpoint "地区 - asia" "$API_URL/api/news?region=asia&page=1&limit=20" 200
sleep 1

echo ""
echo "================================================"
echo "📊 测试 6: 缓存统计"
echo "================================================"
echo -n "获取缓存统计... "
cache_stats=$(curl -s "$API_URL/api/news/cache/stats")

if [[ $cache_stats == *"success"* ]]; then
    echo -e "${GREEN}✅ 成功${NC}"
    echo "$cache_stats" | jq '.' 2>/dev/null || echo "$cache_stats"

    # 提取命中率
    hit_rate=$(echo "$cache_stats" | jq -r '.data.hitRate' 2>/dev/null || echo "N/A")
    if [[ $hit_rate != "N/A" ]]; then
        hit_rate_percent=$(echo "$hit_rate * 100" | bc | cut -d'.' -f1)
        if (( hit_rate_percent >= 80 )); then
            echo -e "${GREEN}✅ 缓存命中率: ${hit_rate_percent}% (优秀)${NC}"
        elif (( hit_rate_percent >= 50 )); then
            echo -e "${YELLOW}⚠️  缓存命中率: ${hit_rate_percent}% (良好)${NC}"
        else
            echo -e "${RED}❌ 缓存命中率: ${hit_rate_percent}% (需要优化)${NC}"
        fi
    fi
else
    echo -e "${RED}❌ 失败${NC}"
fi

echo ""
echo "================================================"
echo "🎯 性能基准"
echo "================================================"
echo "✅ 优秀: < 100ms"
echo "⚠️  良好: 100-200ms"
echo "❌ 需优化: > 200ms"
echo ""
echo "预期目标:"
echo "- 首页缓存加载: < 100ms"
echo "- 搜索查询: < 150ms"
echo "- 分类/地区筛选: < 150ms"
echo "- 缓存命中率: > 80%"
echo ""
echo "================================================"
echo "✨ 测试完成！"
echo "================================================"
