#!/usr/bin/env node

/**
 * Render 部署诊断脚本
 * 检查 Redis 连接、数据库性能、缓存状态
 */

const https = require('https');
const http = require('http');

// 配置
const API_URL = process.env.API_URL || process.argv[2];

if (!API_URL) {
  console.error('❌ 请提供 API URL');
  console.error('用法: node diagnose-render.js https://your-api.onrender.com');
  process.exit(1);
}

const baseUrl = API_URL.replace(/\/$/, '');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
};

function log(color, symbol, message) {
  console.log(`${color}${symbol} ${message}${colors.reset}`);
}

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const startTime = Date.now();

    protocol.get(url, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        const duration = Date.now() - startTime;
        try {
          const json = JSON.parse(data);
          resolve({ data: json, duration, status: res.statusCode });
        } catch (e) {
          reject(new Error(`JSON解析失败: ${e.message}`));
        }
      });
    }).on('error', (e) => {
      reject(e);
    });
  });
}

async function checkHealth() {
  console.log('\n' + '='.repeat(60));
  log(colors.blue, '🔍', '开始诊断 Render 部署状态...');
  console.log('='.repeat(60) + '\n');

  // 1. 健康检查
  try {
    log(colors.gray, '⏳', '1/5 检查服务健康状态...');
    const health = await fetchJSON(`${baseUrl}/api/v1/health`);
    if (health.status === 200) {
      log(colors.green, '✓', `服务在线 (${health.duration}ms)`);
    } else {
      log(colors.red, '✗', `服务异常 (HTTP ${health.status})`);
      return;
    }
  } catch (e) {
    log(colors.red, '✗', `服务不可达: ${e.message}`);
    return;
  }

  // 2. Redis 连接状态
  try {
    log(colors.gray, '⏳', '2/5 检查 Redis 连接...');
    const redis = await fetchJSON(`${baseUrl}/api/v1/redis/health`);

    if (redis.data.connected) {
      log(colors.green, '✓', `Redis 已连接 (${redis.duration}ms)`);
      console.log(`   ${colors.gray}├─ 内存使用: ${redis.data.stats?.memory?.used || 'N/A'}`);
      console.log(`   ├─ 总键数: ${redis.data.stats?.stats?.totalKeys || 0}`);
      console.log(`   └─ 命令处理数: ${redis.data.stats?.stats?.commandsProcessed || 0}${colors.reset}`);
    } else {
      log(colors.red, '✗', 'Redis 未连接 - 缓存已禁用！');
      console.log(`   ${colors.yellow}⚠️  这是性能慢的主要原因！${colors.reset}`);
    }
  } catch (e) {
    log(colors.red, '✗', `Redis 检查失败: ${e.message}`);
  }

  // 3. 缓存统计
  try {
    log(colors.gray, '⏳', '3/5 检查缓存统计...');
    const cache = await fetchJSON(`${baseUrl}/api/v1/redis/stats`);

    console.log(`   ${colors.gray}Redis 状态:`);
    console.log(`   ├─ 可用: ${cache.data.redis?.available ? '✓' : '✗'}`);
    console.log(`   └─ 内存缓存大小: ${cache.data.memory?.size || 0}${colors.reset}`);

    if (!cache.data.redis?.available) {
      log(colors.yellow, '⚠️', '正在使用内存缓存降级方案（重启后失效）');
    }
  } catch (e) {
    log(colors.yellow, '⚠️', `缓存统计获取失败: ${e.message}`);
  }

  // 4. 首页加载性能测试
  try {
    log(colors.gray, '⏳', '4/5 测试首页加载速度...');

    // 第一次请求（冷缓存）
    const cold = await fetchJSON(`${baseUrl}/api/news?page=1&limit=20`);
    log(colors.blue, '📊', `首次加载: ${cold.duration}ms`);

    // 第二次请求（热缓存）
    const warm = await fetchJSON(`${baseUrl}/api/news?page=1&limit=20`);
    log(colors.blue, '📊', `缓存加载: ${warm.duration}ms`);

    const improvement = ((cold.duration - warm.duration) / cold.duration * 100).toFixed(1);

    if (warm.duration < 100) {
      log(colors.green, '✓', `缓存生效！性能提升 ${improvement}%`);
    } else if (warm.duration < cold.duration) {
      log(colors.yellow, '⚠️', `部分缓存生效，提升 ${improvement}%`);
    } else {
      log(colors.red, '✗', '缓存未生效！每次都在查数据库');
    }

    console.log(`\n   ${colors.gray}性能基准:`);
    console.log(`   ├─ 优秀: < 100ms`);
    console.log(`   ├─ 良好: 100-200ms`);
    console.log(`   ├─ 一般: 200-500ms`);
    console.log(`   └─ 差: > 500ms${colors.reset}\n`);

  } catch (e) {
    log(colors.red, '✗', `性能测试失败: ${e.message}`);
  }

  // 5. 搜索性能测试
  try {
    log(colors.gray, '⏳', '5/5 测试搜索性能...');
    const search = await fetchJSON(`${baseUrl}/api/news?search=AI`);
    log(colors.blue, '📊', `搜索响应: ${search.duration}ms`);

    if (search.duration < 200) {
      log(colors.green, '✓', '搜索性能优秀');
    } else if (search.duration < 500) {
      log(colors.yellow, '⚠️', '搜索性能一般');
    } else {
      log(colors.red, '✗', '搜索性能差，考虑添加全文搜索索引');
    }
  } catch (e) {
    log(colors.yellow, '⚠️', `搜索测试失败: ${e.message}`);
  }

  // 总结和建议
  console.log('\n' + '='.repeat(60));
  log(colors.blue, '💡', '诊断建议');
  console.log('='.repeat(60) + '\n');

  console.log(`${colors.yellow}如果 Redis 未连接，请按以下步骤操作：${colors.reset}\n`);
  console.log(`1. 登录 Render Dashboard: https://dashboard.render.com`);
  console.log(`2. 创建 Redis 服务 (New > Redis)`);
  console.log(`3. 复制 Redis 连接信息`);
  console.log(`4. 在后端服务的环境变量中添加:`);
  console.log(`   ${colors.green}REDIS_URL${colors.reset}=redis://...`);
  console.log(`   或`);
  console.log(`   ${colors.green}REDIS_HOST${colors.reset}=red-xxxxx.render.com`);
  console.log(`   ${colors.green}REDIS_PORT${colors.reset}=6379\n`);

  console.log(`${colors.yellow}如果性能仍然慢：${colors.reset}\n`);
  console.log(`1. 检查数据库索引是否创建 (运行 pnpm prisma:migrate)`);
  console.log(`2. 查看 Render 日志中的慢查询`);
  console.log(`3. 考虑升级到付费计划（更快的实例启动）\n`);

  console.log('='.repeat(60) + '\n');
}

checkHealth().catch(console.error);
