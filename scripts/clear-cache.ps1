# 清除 AI 新闻缓存脚本 (PowerShell)
# 使用方法：
#   1. 修改下面的 $API_URL 为你的 Render 应用 URL
#   2. 在 PowerShell 中运行：.\scripts\clear-cache.ps1

# ============================================
# 配置项：请修改为你的实际 URL
# ============================================
$API_URL = "https://your-app.onrender.com"  # 修改这里！例如：https://aipush.onrender.com

# ============================================
# 脚本逻辑（无需修改）
# ============================================

function Write-ColorMessage {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

try {
    Write-ColorMessage "`n🚀 开始清除 AI 新闻缓存...`n" "Cyan"

    # 1. 检查 API 是否可访问
    Write-ColorMessage "1️⃣  检查 API 连接..." "Yellow"
    $statsResponse = Invoke-RestMethod -Uri "$API_URL/api/v1/news/cache/stats" -Method Get
    Write-ColorMessage "   ✅ API 连接成功" "Green"
    Write-ColorMessage "   📊 当前缓存状态:" "Blue"
    Write-ColorMessage "      - Redis 可用: $($statsResponse.data.redis.available)" "Blue"
    Write-ColorMessage "      - 内存缓存条目: $($statsResponse.data.memory.size)" "Blue"

    # 2. 清除缓存
    Write-ColorMessage "`n2️⃣  清除旧缓存..." "Yellow"
    $clearResponse = Invoke-RestMethod -Uri "$API_URL/api/v1/news/cache/ai-news" -Method Delete

    if ($clearResponse.success) {
        Write-ColorMessage "   ✅ 成功清除 $($clearResponse.data.deletedCount) 条缓存" "Green"
    } else {
        Write-ColorMessage "   ⚠️  清除可能未完全成功" "Yellow"
    }

    # 3. 生成新数据
    Write-ColorMessage "`n3️⃣  生成新的 AI 新闻..." "Yellow"
    Write-ColorMessage "   ⏳ 调用 GLM API 生成新数据（可能需要 5-10 秒）..." "Yellow"

    $generateResponse = Invoke-RestMethod -Uri "$API_URL/api/v1/news/ai/generate?count=8" -Method Get

    if ($generateResponse.success -and $generateResponse.data.Count -gt 0) {
        Write-ColorMessage "   ✅ 成功生成 $($generateResponse.data.Count) 条新闻" "Green"

        # 4. 验证中文字段
        Write-ColorMessage "`n4️⃣  验证中文字段..." "Yellow"
        $firstNews = $generateResponse.data[0]

        $hasTitleCn = -not [string]::IsNullOrEmpty($firstNews.titleCn)
        $hasSummaryCn = -not [string]::IsNullOrEmpty($firstNews.summaryCn)

        if ($hasTitleCn -and $hasSummaryCn) {
            Write-ColorMessage "   ✅ 中文字段验证成功！" "Green"
            Write-ColorMessage "`n📝 示例数据:" "Cyan"
            Write-ColorMessage "   英文标题: $($firstNews.title)" "Blue"
            Write-ColorMessage "   中文标题: $($firstNews.titleCn)" "Green"
            Write-ColorMessage "   英文摘要: $($firstNews.summary.Substring(0, [Math]::Min(60, $firstNews.summary.Length)))..." "Blue"
            Write-ColorMessage "   中文摘要: $($firstNews.summaryCn.Substring(0, [Math]::Min(60, $firstNews.summaryCn.Length)))..." "Green"
        } else {
            Write-ColorMessage "   ❌ 警告：新数据中缺少中文字段" "Red"
            Write-ColorMessage "      titleCn: $(if ($hasTitleCn) { '✅' } else { '❌' })" $(if ($hasTitleCn) { "Green" } else { "Red" })
            Write-ColorMessage "      summaryCn: $(if ($hasSummaryCn) { '✅' } else { '❌' })" $(if ($hasSummaryCn) { "Green" } else { "Red" })
            Write-ColorMessage "`n   可能原因：" "Yellow"
            Write-ColorMessage "   - Render 部署未完成" "Yellow"
            Write-ColorMessage "   - 代码更新未生效" "Yellow"
            Write-ColorMessage "   - GLM API 响应格式问题" "Yellow"
        }
    } else {
        Write-ColorMessage "   ❌ 生成新闻失败或返回空数据" "Red"
    }

    # 5. 最终状态检查
    Write-ColorMessage "`n5️⃣  最终状态检查..." "Yellow"
    $finalStats = Invoke-RestMethod -Uri "$API_URL/api/v1/news/cache/stats" -Method Get
    Write-ColorMessage "   📊 最新缓存状态:" "Blue"
    Write-ColorMessage "      - Redis 可用: $($finalStats.data.redis.available)" "Blue"
    Write-ColorMessage "      - 内存缓存条目: $($finalStats.data.memory.size)" "Blue"

    Write-ColorMessage "`n✅ 缓存清除完成！`n" "Green"

} catch {
    Write-ColorMessage "`n❌ 错误: $($_.Exception.Message)`n" "Red"

    if ($API_URL -eq "https://your-app.onrender.com") {
        Write-ColorMessage "💡 提示：请先修改脚本中的 `$API_URL 为你的实际 Render 应用地址！`n" "Yellow"
    }

    exit 1
}
