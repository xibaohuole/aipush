import { Injectable, Logger, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../../../common/prisma/prisma.service";
import { RedisService } from "../../../common/redis/redis.service";

/**
 * 已读记录服务
 */
@Injectable()
export class ReadHistoryService {
  private readonly logger = new Logger(ReadHistoryService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  /**
   * 标记新闻为已读
   */
  async markAsRead(
    newsId: string,
    sessionId: string,
    userId?: string,
    readDuration?: number,
    scrollDepth?: number,
  ) {
    try {
      if (!userId && !sessionId) {
        throw new BadRequestException("Either userId or sessionId is required");
      }

      // 创建或更新已读记录
      const readHistory = userId
        ? await this.prisma.readHistory.upsert({
            where: {
              userId_newsId: { userId, newsId },
            } as any,
            update: {
              readAt: new Date(),
              readDuration: readDuration ?? undefined,
              scrollDepth: scrollDepth ?? undefined,
            },
            create: {
              newsId,
              userId,
              readDuration: readDuration ?? undefined,
              scrollDepth: scrollDepth ?? undefined,
            },
          })
        : await this.prisma.readHistory.upsert({
            where: {
              sessionId_newsId: { sessionId, newsId },
            } as any,
            update: {
              readAt: new Date(),
              readDuration: readDuration ?? undefined,
              scrollDepth: scrollDepth ?? undefined,
            },
            create: {
              newsId,
              sessionId,
              readDuration: readDuration ?? undefined,
              scrollDepth: scrollDepth ?? undefined,
            },
          });

      // 缓存到 Redis (TTL: 7天)
      const cacheKey = userId
        ? `read:user:${userId}:${newsId}`
        : `read:session:${sessionId}:${newsId}`;
      await this.redis.set(cacheKey, JSON.stringify(readHistory), 604800);

      this.logger.log(`News ${newsId} marked as read`);
      return readHistory;
    } catch (error: any) {
      this.logger.error(`Failed to mark news as read: ${error.message}`);
      throw error;
    }
  }

  /**
   * 检查新闻是否已读
   */
  async isRead(
    newsId: string,
    sessionId: string,
    userId?: string,
  ): Promise<boolean> {
    // 先检查 Redis
    const cacheKey = userId
      ? `read:user:${userId}:${newsId}`
      : `read:session:${sessionId}:${newsId}`;

    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return true;
    }

    // 检查数据库
    const readHistory = userId
      ? await this.prisma.readHistory.findUnique({
          where: {
            userId_newsId: { userId, newsId },
          } as any,
        })
      : await this.prisma.readHistory.findUnique({
          where: {
            sessionId_newsId: { sessionId, newsId },
          } as any,
        });
    if (readHistory) {
      // 回写到 Redis
      await this.redis.set(cacheKey, JSON.stringify(readHistory), 604800);
      return true;
    }

    return false;
  }

  /**
   * 批量检查已读状态
   */
  async checkMultipleReadStatus(
    newsIds: string[],
    sessionId: string,
    userId?: string,
  ): Promise<Record<string, boolean>> {
    if (!userId && !sessionId) {
      return {};
    }

    const where = userId
      ? { userId, newsId: { in: newsIds } }
      : { sessionId, newsId: { in: newsIds } };

    const readRecords = await this.prisma.readHistory.findMany({
      where,
      select: { newsId: true },
    });

    const readIds = new Set(
      readRecords.map((r: { newsId: string }) => r.newsId),
    );

    const result: Record<string, boolean> = {};
    for (const newsId of newsIds) {
      result[newsId] = readIds.has(newsId);
    }

    return result;
  }

  /**
   * 获取用户的已读历史
   */
  async getUserReadHistory(
    sessionId: string,
    userId?: string,
    page: number = 1,
    limit: number = 20,
  ) {
    if (!userId && !sessionId) {
      throw new BadRequestException("Either userId or sessionId is required");
    }

    const skip = (page - 1) * limit;

    const where = userId ? { userId } : { sessionId };

    const [items, total] = await Promise.all([
      this.prisma.readHistory.findMany({
        where,
        skip,
        take: limit,
        orderBy: { readAt: "desc" },
        include: {
          news: {
            select: {
              id: true,
              title: true,
              titleCn: true,
              summary: true,
              summaryCn: true,
              category: true,
              region: true,
              impactScore: true,
              publishedAt: true,
              source: true,
              sourceUrl: true,
              isTrending: true,
              tags: true,
            },
          },
        },
      }),
      this.prisma.readHistory.count({ where }),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 获取已读统计
   */
  async getReadStats(sessionId: string, userId?: string) {
    if (!userId && !sessionId) {
      return {
        totalRead: 0,
        todayRead: 0,
        weekRead: 0,
        avgReadDuration: 0,
      };
    }

    const where = userId ? { userId } : { sessionId };

    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [totalRead, todayRead, weekRead, durationStats] = await Promise.all([
      this.prisma.readHistory.count({ where }),
      this.prisma.readHistory.count({
        where: {
          ...where,
          readAt: { gte: todayStart },
        },
      }),
      this.prisma.readHistory.count({
        where: {
          ...where,
          readAt: { gte: weekStart },
        },
      }),
      this.prisma.readHistory.aggregate({
        where: {
          ...where,
          readDuration: { not: null },
        },
        _avg: {
          readDuration: true,
        },
      }),
    ]);

    return {
      totalRead,
      todayRead,
      weekRead,
      avgReadDuration: Math.round(durationStats._avg.readDuration || 0),
    };
  }

  /**
   * 清除旧的已读记录（保留最近30天）
   */
  async cleanOldReadHistory() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const result = await this.prisma.readHistory.deleteMany({
      where: {
        readAt: { lt: thirtyDaysAgo },
      },
    });

    this.logger.log(`Cleaned ${result.count} old read history records`);
    return result.count;
  }
}
