import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { RSSParserService, ParsedNewsItem } from './rss-parser.service';
import { AIAnalyzerService } from './ai-analyzer.service';
import { getEnabledSources, NewsSource } from '../config/news-sources.config';
import pLimit from 'p-limit';

/**
 * 新闻爬取服务
 * 整合 RSS 解析、AI 分析和数据存储
 */
@Injectable()
export class NewsScraperService {
  private readonly logger = new Logger(NewsScraperService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly rssParser: RSSParserService,
    private readonly aiAnalyzer: AIAnalyzerService,
  ) {}

  /**
   * 执行完整的新闻爬取流程
   * 使用并发处理提升性能
   */
  async scrapeNews(): Promise<{
    total: number;
    new: number;
    duplicate: number;
    failed: number;
  }> {
    this.logger.log('Starting news scraping process...');

    const sources = getEnabledSources();
    this.logger.log(`Found ${sources.length} enabled news sources`);

    // 准备 RSS feeds
    const feeds = sources.map(source => ({
      url: source.url,
      name: source.name,
      sourceConfig: source,
    }));

    // 解析所有 RSS feeds
    const parsedItems = await this.rssParser.parseMultipleFeeds(
      feeds.map(f => ({ url: f.url, name: f.name }))
    );

    this.logger.log(`Parsed ${parsedItems.length} news items from RSS feeds`);

    // 处理每个新闻条目（并发处理，限制并发数为 5）
    const stats = {
      total: parsedItems.length,
      new: 0,
      duplicate: 0,
      failed: 0,
    };

    // 创建并发限制器（同时最多处理 5 条新闻）
    const limit = pLimit(5);

    // 并发处理所有新闻条目
    const results = await Promise.allSettled(
      parsedItems.map(item =>
        limit(async () => {
          const source = sources.find(s => s.name === item.source);
          return this.processNewsItem(item, source);
        })
      )
    );

    // 统计结果
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        if (result.value === 'new') stats.new++;
        else if (result.value === 'duplicate') stats.duplicate++;
      } else {
        this.logger.error(
          `Failed to process news item: ${parsedItems[index].title}`,
          result.reason
        );
        stats.failed++;
      }
    });

    this.logger.log(
      `Scraping complete: ${stats.new} new, ${stats.duplicate} duplicates, ${stats.failed} failed`
    );

    return stats;
  }

  /**
   * 处理单个新闻条目
   */
  private async processNewsItem(
    item: ParsedNewsItem,
    source?: NewsSource
  ): Promise<'new' | 'duplicate' | 'updated'> {
    // 检查是否已存在（基于 URL）
    const existing = await this.prisma.news.findFirst({
      where: {
        sourceUrl: item.link,
      },
    });

    if (existing) {
      this.logger.debug(`Duplicate news item: ${item.title}`);
      return 'duplicate';
    }

    // 使用 AI 分析新闻
    const analysis = await this.aiAnalyzer.analyzeNews(
      item.title,
      item.content,
      source?.category
    );

    // 存储到数据库
    await this.prisma.news.create({
      data: {
        title: item.title,
        summary: analysis.summary,
        whyItMatters: analysis.whyItMatters || null,
        source: item.source || null,
        sourceUrl: item.link,
        category: analysis.category as any,
        region: analysis.region as any,
        impactScore: analysis.impactScore,
        publishedAt: item.publishedAt,
        fetchedAt: new Date(),
        isCustom: false,
        tags: analysis.tags,
        isApproved: true, // 自动批准 RSS 新闻
      },
    });

    this.logger.debug(`Saved new news item: ${item.title}`);

    return 'new';
  }

  /**
   * 清理旧新闻（超过30天）
   */
  async cleanOldNews(daysToKeep: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await this.prisma.news.updateMany({
      where: {
        publishedAt: {
          lt: cutoffDate,
        },
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    this.logger.log(`Soft-deleted ${result.count} old news items`);

    return result.count;
  }

  /**
   * 更新趋势新闻标记
   */
  async updateTrendingNews(): Promise<void> {
    // 先清除所有趋势标记
    await this.prisma.news.updateMany({
      where: { isTrending: true },
      data: { isTrending: false },
    });

    // 查找最近24小时内高影响力的新闻
    const oneDayAgo = new Date();
    oneDayAgo.setHours(oneDayAgo.getHours() - 24);

    const trendingNews = await this.prisma.news.findMany({
      where: {
        publishedAt: {
          gte: oneDayAgo,
        },
        deletedAt: null,
        impactScore: {
          gte: 7, // 影响分数 >= 7
        },
      },
      orderBy: [
        { impactScore: 'desc' },
        { viewCount: 'desc' },
        { bookmarkCount: 'desc' },
      ],
      take: 10, // 最多10条trending
    });

    // 标记为trending
    await this.prisma.news.updateMany({
      where: {
        id: {
          in: trendingNews.map(n => n.id),
        },
      },
      data: {
        isTrending: true,
      },
    });

    this.logger.log(`Updated ${trendingNews.length} trending news items`);
  }

  /**
   * 手动爬取单个新闻源
   */
  async scrapeSingleSource(sourceId: string): Promise<number> {
    const sources = getEnabledSources();
    const source = sources.find(s => s.id === sourceId);

    if (!source) {
      throw new Error(`News source not found: ${sourceId}`);
    }

    this.logger.log(`Scraping single source: ${source.name}`);

    const items = await this.rssParser.parseFeed(source.url, source.name);

    let newCount = 0;

    for (const item of items) {
      try {
        const result = await this.processNewsItem(item, source);
        if (result === 'new') newCount++;
      } catch (error: any) {
        this.logger.error(
          `Failed to process item from ${source.name}: ${error.message}`
        );
      }
    }

    this.logger.log(
      `Scraped ${newCount} new items from ${source.name} (${items.length} total)`
    );

    return newCount;
  }

  /**
   * 获取爬取统计信息
   */
  async getScrapingStats(): Promise<{
    totalNews: number;
    todayNews: number;
    last24Hours: number;
    byCategory: Array<{ category: string; count: number }>;
    bySource: Array<{ source: string; count: number }>;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const last24h = new Date();
    last24h.setHours(last24h.getHours() - 24);

    const [totalNews, todayNews, last24Hours, byCategory, bySource] =
      await Promise.all([
        this.prisma.news.count({
          where: { deletedAt: null },
        }),
        this.prisma.news.count({
          where: {
            fetchedAt: { gte: today },
            deletedAt: null,
          },
        }),
        this.prisma.news.count({
          where: {
            fetchedAt: { gte: last24h },
            deletedAt: null,
          },
        }),
        this.prisma.news.groupBy({
          by: ['category'],
          _count: true,
          where: { deletedAt: null },
        }),
        this.prisma.news.groupBy({
          by: ['source'],
          _count: true,
          where: {
            deletedAt: null,
            source: { not: null },
          },
          orderBy: { _count: { source: 'desc' } },
          take: 10,
        }),
      ]);

    return {
      totalNews,
      todayNews,
      last24Hours,
      byCategory: byCategory.map(item => ({
        category: item.category,
        count: item._count,
      })),
      bySource: bySource.map(item => ({
        source: item.source || 'Unknown',
        count: item._count,
      })),
    };
  }
}
