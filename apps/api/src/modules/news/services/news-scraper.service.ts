import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../../common/prisma/prisma.service";
import { RSSParserService, ParsedNewsItem } from "./rss-parser.service";
import { AIAnalyzerService } from "./ai-analyzer.service";
import { getEnabledSources, NewsSource } from "../config/news-sources.config";
import pLimit from "p-limit";

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
    this.logger.log("Starting news scraping process...");

    const sources = getEnabledSources();
    this.logger.log(`Found ${sources.length} enabled news sources`);

    // 准备 RSS feeds
    const feeds = sources.map((source) => ({
      url: source.url,
      name: source.name,
      sourceConfig: source,
    }));

    // 解析所有 RSS feeds
    const parsedItems = await this.rssParser.parseMultipleFeeds(
      feeds.map((f) => ({ url: f.url, name: f.name })),
    );

    this.logger.log(`Parsed ${parsedItems.length} news items from RSS feeds`);

    // 处理每个新闻条目（并发处理，限制并发数以避免GLM API限流）
    const stats = {
      total: parsedItems.length,
      new: 0,
      duplicate: 0,
      failed: 0,
    };

    // 创建并发限制器（同时最多处理 4 条新闻，平衡效率和API限流风险）
    const limit = pLimit(4);

    this.logger.log(`开始处理 ${parsedItems.length} 条新闻，并发数: 4`);

    // 并发处理所有新闻条目
    const results = await Promise.allSettled(
      parsedItems.map((item, index) =>
        limit(async () => {
          const source = sources.find((s) => s.name === item.source);
          this.logger.debug(
            `[${index + 1}/${parsedItems.length}] 处理新闻: ${item.title.substring(0, 50)}...`,
          );
          return this.processNewsItem(item, source);
        }),
      ),
    );

    // 统计结果
    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        if (result.value === "new") stats.new++;
        else if (result.value === "duplicate") stats.duplicate++;
      } else {
        const errorMsg =
          result.reason?.message || result.reason?.toString() || "未知错误";
        this.logger.error(
          `处理新闻失败 [${index + 1}/${parsedItems.length}]: ${parsedItems[index].title.substring(0, 50)}...`,
        );
        this.logger.error(`  错误原因: ${errorMsg}`);
        stats.failed++;
      }
    });

    this.logger.log(
      `Scraping complete: ${stats.new} new, ${stats.duplicate} duplicates, ${stats.failed} failed`,
    );

    return stats;
  }

  /**
   * 处理单个新闻条目
   */
  private async processNewsItem(
    item: ParsedNewsItem,
    source?: NewsSource,
  ): Promise<"new" | "duplicate" | "updated"> {
    try {
      // 检查是否已存在（基于 URL，排除已删除的）
      const existing = await this.prisma.news.findFirst({
        where: {
          sourceUrl: item.link,
          deletedAt: null, // 只检查未删除的新闻
        },
      });

      if (existing) {
        this.logger.debug(`跳过重复新闻: ${item.title.substring(0, 50)}...`);
        return "duplicate";
      }

      // 使用 AI 分析新闻
      this.logger.debug(`开始AI分析: ${item.title.substring(0, 50)}...`);
      const analysis = await this.aiAnalyzer.analyzeNews(
        item.title,
        item.content,
        source?.category,
      );

      // 存储到数据库
      this.logger.debug(`保存新闻到数据库: ${item.title.substring(0, 50)}...`);
      await this.prisma.news.create({
        data: {
          title: item.title,
          titleCn: analysis.titleCn || null,
          summary: analysis.summary,
          summaryCn: analysis.summaryCn || null,
          whyItMatters: analysis.whyItMatters || null,
          whyItMattersCn: analysis.whyItMattersCn || null,
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

      this.logger.log(
        `✓ 成功保存新闻: ${item.title.substring(0, 50)}... (中文标题: ${analysis.titleCn ? "√" : "×"})`,
      );

      return "new";
    } catch (error: any) {
      // 检查是否是数据库唯一约束冲突
      if (
        error.code === "P2002" ||
        error.message?.includes("Unique constraint")
      ) {
        this.logger.warn(
          `数据库唯一约束冲突，新闻已存在: ${item.title.substring(0, 50)}...`,
        );
        return "duplicate";
      }

      // 记录详细错误信息
      this.logger.error(`处理新闻条目失败: ${item.title.substring(0, 50)}...`);
      this.logger.error(`  来源: ${item.source}`);
      this.logger.error(`  URL: ${item.link}`);
      this.logger.error(`  错误: ${error.message}`);
      if (error.stack) {
        this.logger.debug(`  堆栈: ${error.stack}`);
      }

      // 重新抛出错误，让上层统计
      throw error;
    }
  }

  /**
   * 清理旧新闻（超过N天）
   * 如果 daysToKeep 为 -1，则删除所有新闻
   */
  async cleanOldNews(daysToKeep: number = 30): Promise<number> {
    // 如果 daysToKeep 为 -1，删除所有新闻
    if (daysToKeep === -1) {
      const result = await this.prisma.news.updateMany({
        where: {
          deletedAt: null,
        },
        data: {
          deletedAt: new Date(),
        },
      });

      this.logger.log(`Soft-deleted all ${result.count} news items`);
      return result.count;
    }

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
        { impactScore: "desc" },
        { viewCount: "desc" },
        { bookmarkCount: "desc" },
      ],
      take: 10, // 最多10条trending
    });

    // 标记为trending
    await this.prisma.news.updateMany({
      where: {
        id: {
          in: trendingNews.map((n) => n.id),
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
    const source = sources.find((s) => s.id === sourceId);

    if (!source) {
      throw new Error(`News source not found: ${sourceId}`);
    }

    this.logger.log(`Scraping single source: ${source.name}`);

    const items = await this.rssParser.parseFeed(source.url, source.name);

    let newCount = 0;

    for (const item of items) {
      try {
        const result = await this.processNewsItem(item, source);
        if (result === "new") newCount++;
      } catch (error: any) {
        this.logger.error(
          `Failed to process item from ${source.name}: ${error.message}`,
        );
      }
    }

    this.logger.log(
      `Scraped ${newCount} new items from ${source.name} (${items.length} total)`,
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
          by: ["category"],
          _count: true,
          where: { deletedAt: null },
        }),
        this.prisma.news.groupBy({
          by: ["source"],
          _count: true,
          where: {
            deletedAt: null,
            source: { not: null },
          },
          orderBy: { _count: { source: "desc" } },
          take: 10,
        }),
      ]);

    return {
      totalNews,
      todayNews,
      last24Hours,
      byCategory: byCategory.map((item) => ({
        category: item.category,
        count: item._count,
      })),
      bySource: bySource.map((item) => ({
        source: item.source || "Unknown",
        count: item._count,
      })),
    };
  }
}
