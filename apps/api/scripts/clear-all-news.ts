#!/usr/bin/env ts-node

/**
 * 清除所有新闻数据的脚本
 * 用于重新开始抓取和分析新闻
 */

import { PrismaClient } from '@prisma/client';
import { createClient } from 'redis';

const prisma = new PrismaClient();

async function clearAllNews() {
  console.log('🚀 开始清除所有新闻数据...\n');

  try {
    // 1. 连接 Redis
    console.log('1️⃣  连接 Redis...');
    try {
      const redis = createClient({
        url: 'redis://localhost:6379',
        socket: {
          connectTimeout: 5000,
        },
      });

      await redis.connect();

      // 清除所有 AI 新闻缓存
      const keys = await redis.keys('ai-news:*');
      if (keys.length > 0) {
        await redis.del(keys);
        console.log(`   ✅ 已清除 ${keys.length} 个 Redis 缓存键`);
      } else {
        console.log('   ✅ Redis 中没有需要清除的缓存');
      }

      // 清除去重集合
      const dedupeKeys = await redis.keys('ai-news:titles:dedupe');
      if (dedupeKeys.length > 0) {
        await redis.del(dedupeKeys);
        console.log('   ✅ 已清除去重集合');
      }

      await redis.quit();
    } catch (redisError: any) {
      console.log('   ⚠️  Redis 连接失败，跳过 Redis 清理:', redisError.message);
    }

    // 2. 删除所有相关数据
    console.log('\n2️⃣  删除数据库中的所有新闻数据...');

    // 删除相关联的数据（按依赖顺序）
    const [deletedShares, deletedComments, deletedBookmarks, deletedNews] =
      await prisma.$transaction([
        prisma.share.deleteMany({}),
        prisma.comment.deleteMany({}),
        prisma.bookmark.deleteMany({}),
        prisma.news.deleteMany({}),
      ]);

    console.log(`   ✅ 已删除 ${deletedShares.count} 条分享记录`);
    console.log(`   ✅ 已删除 ${deletedComments.count} 条评论`);
    console.log(`   ✅ 已删除 ${deletedBookmarks.count} 条书签`);
    console.log(`   ✅ 已删除 ${deletedNews.count} 条新闻`);

    // 3. 验证清除结果
    console.log('\n3️⃣  验证清除结果...');
    const remainingNews = await prisma.news.count();
    console.log(`   📊 数据库中剩余新闻数: ${remainingNews}`);

    if (remainingNews === 0) {
      console.log('\n✅ 所有新闻数据已成功清除！\n');
      console.log('💡 提示：现在可以重新部署 API 并重新抓取新闻了。');
    } else {
      console.log('\n⚠️  警告：仍有部分新闻数据未清除。');
    }
  } catch (error: any) {
    console.error(`\n❌ 错误: ${error.message}\n`);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// 运行脚本
clearAllNews();
