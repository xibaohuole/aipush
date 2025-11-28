#!/usr/bin/env node

/**
 * 清除 AI 新闻缓存脚本
 * 使用方法：
 *   1. 修改下面的 API_URL 为你的 Render 应用 URL
 *   2. 运行：node scripts/clear-cache.js
 */

// ============================================
// 配置项：请修改为你的实际 URL
// ============================================
const API_URL = "https://aipush.onrender.com"; // 修改这里！例如：https://aipush.onrender.com

// ============================================
// 脚本逻辑（无需修改）
// ============================================

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function clearCache() {
  try {
    log("\n🚀 开始清除 AI 新闻缓存...\n", "bright");

    // 1. 检查 API 是否可访问
    log("1️⃣  检查 API 连接...", "cyan");
    const healthCheck = await fetch(`${API_URL}/api/v1/news/cache/stats`);

    if (!healthCheck.ok) {
      throw new Error(
        `API 不可访问: ${healthCheck.status} ${healthCheck.statusText}`
      );
    }

    const stats = await healthCheck.json();
    log(`   ✅ API 连接成功`, "green");
    log(`   📊 当前缓存状态:`, "blue");

    // 处理双层嵌套的数据结构
    const cacheData = stats.data.data || stats.data;
    log(`      - Redis 可用: ${cacheData.redis.available}`, "blue");
    log(`      - 内存缓存条目: ${cacheData.memory.size}`, "blue");

    if (!cacheData.redis.available) {
      log(`   ⚠️  注意：Redis 不可用，使用内存缓存降级策略`, "yellow");
    }

    // 2. 清除缓存
    log("\n2️⃣  清除旧缓存...", "cyan");
    const clearResponse = await fetch(`${API_URL}/api/v1/news/cache/ai-news`, {
      method: "DELETE",
    });

    if (!clearResponse.ok) {
      throw new Error(
        `清除失败: ${clearResponse.status} ${clearResponse.statusText}`
      );
    }

    const clearResult = await clearResponse.json();
    if (clearResult.success) {
      log(`   ✅ 成功清除 ${clearResult.data.deletedCount} 条缓存`, "green");
    } else {
      log(`   ⚠️  清除可能未完全成功`, "yellow");
    }

    // 3. 生成新数据
    log("\n3️⃣  生成新的 AI 新闻...", "cyan");
    log("   ⏳ 调用 GLM API 生成新数据（可能需要 5-10 秒）...", "yellow");

    const generateResponse = await fetch(
      `${API_URL}/api/v1/news/ai/generate?count=8`
    );

    if (!generateResponse.ok) {
      throw new Error(
        `生成失败: ${generateResponse.status} ${generateResponse.statusText}`
      );
    }

    const generateResult = await generateResponse.json();

    if (generateResult.success && generateResult.data.length > 0) {
      log(`   ✅ 成功生成 ${generateResult.data.length} 条新闻`, "green");

      // 4. 验证中文字段
      log("\n4️⃣  验证中文字段...", "cyan");
      const firstNews = generateResult.data[0];

      const hasTitleCn = !!firstNews.titleCn;
      const hasSummaryCn = !!firstNews.summaryCn;

      if (hasTitleCn && hasSummaryCn) {
        log(`   ✅ 中文字段验证成功！`, "green");
        log(`\n📝 示例数据:`, "bright");
        log(`   英文标题: ${firstNews.title}`, "blue");
        log(`   中文标题: ${firstNews.titleCn}`, "green");
        log(`   英文摘要: ${firstNews.summary.substring(0, 60)}...`, "blue");
        log(`   中文摘要: ${firstNews.summaryCn.substring(0, 60)}...`, "green");
      } else {
        log(`   ❌ 警告：新数据中缺少中文字段`, "red");
        log(
          `      titleCn: ${hasTitleCn ? "✅" : "❌"}`,
          hasTitleCn ? "green" : "red"
        );
        log(
          `      summaryCn: ${hasSummaryCn ? "✅" : "❌"}`,
          hasSummaryCn ? "green" : "red"
        );
        log(`\n   可能原因：`, "yellow");
        log(`   - Render 部署未完成`, "yellow");
        log(`   - 代码更新未生效`, "yellow");
        log(`   - GLM API 响应格式问题`, "yellow");
      }
    } else {
      log(`   ❌ 生成新闻失败或返回空数据`, "red");
    }

    // 5. 最终状态检查
    log("\n5️⃣  最终状态检查...", "cyan");
    const finalStats = await fetch(`${API_URL}/api/v1/news/cache/stats`);
    const finalData = await finalStats.json();

    // 处理双层嵌套的数据结构
    const finalCacheData = finalData.data.data || finalData.data;
    log(`   📊 最新缓存状态:`, "blue");
    log(`      - Redis 可用: ${finalCacheData.redis.available}`, "blue");
    log(`      - 内存缓存条目: ${finalCacheData.memory.size}`, "blue");

    log("\n✅ 缓存清除完成！\n", "bright");
  } catch (error) {
    log(`\n❌ 错误: ${error.message}\n`, "red");

    if (API_URL === "https://your-app.onrender.com") {
      log(
        "💡 提示：请先修改脚本中的 API_URL 为你的实际 Render 应用地址！\n",
        "yellow"
      );
    }

    process.exit(1);
  }
}

// 运行脚本
clearCache();
