import { Injectable, Logger, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../../../common/prisma/prisma.service";
import { RedisService } from "../../../common/redis/redis.service";

/**
 * 书签服务
 */
@Injectable()
export class BookmarkService {
  private readonly logger = new Logger(BookmarkService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  /**
   * 添加书签
   */
  async addBookmark(newsId: string, sessionId: string, userId?: string) {
    try {
      if (!userId && !sessionId) {
        throw new BadRequestException("Either userId or sessionId is required");
      }

      // 创建书签
      const bookmark = await this.prisma.bookmark.create({
        data: {
          newsId,
          ...(userId && { userId }),
          ...(sessionId && !userId && { sessionId }),
        },
      });

      // 更新新闻表的书签计数
      await this.prisma.news.update({
        where: { id: newsId },
        data: { bookmarkCount: { increment: 1 } },
      });

      // 缓存到 Redis (TTL: 24小时)
      const cacheKey = userId
        ? `bookmark:user:${userId}:${newsId}`
        : `bookmark:session:${sessionId}:${newsId}`;
      await this.redis.set(cacheKey, JSON.stringify(bookmark), 86400);

      this.logger.log(`Bookmark added: ${bookmark.id} for news ${newsId}`);
      return bookmark;
    } catch (error: any) {
      // 如果是唯一约束冲突，说明已经收藏了
      if (error.code === "P2002") {
        return await this.getBookmark(newsId, sessionId, userId);
      }
      throw error;
    }
  }

  /**
   * 移除书签
   */
  async removeBookmark(newsId: string, sessionId: string, userId?: string) {
    if (!userId && !sessionId) {
      throw new BadRequestException("Either userId or sessionId is required");
    }

    if (userId) {
      await this.prisma.bookmark.delete({
        where: {
          userId_newsId: { userId, newsId },
        } as any,
      });
    } else {
      await this.prisma.bookmark.delete({
        where: {
          sessionId_newsId: { sessionId, newsId },
        } as any,
      });
    }

    // 更新新闻表的书签计数
    await this.prisma.news.update({
      where: { id: newsId },
      data: { bookmarkCount: { decrement: 1 } },
    });

    // 从 Redis 删除
    const cacheKey = userId
      ? `bookmark:user:${userId}:${newsId}`
      : `bookmark:session:${sessionId}:${newsId}`;
    await this.redis.del(cacheKey);

    this.logger.log(`Bookmark removed for news ${newsId}`);
    return { success: true };
  }

  /**
   * 获取单个书签
   */
  async getBookmark(newsId: string, sessionId: string, userId?: string) {
    if (userId) {
      return await this.prisma.bookmark.findUnique({
        where: {
          userId_newsId: { userId, newsId },
        } as any,
      });
    } else {
      return await this.prisma.bookmark.findUnique({
        where: {
          sessionId_newsId: { sessionId, newsId },
        } as any,
      });
    }
  }

  /**
   * 获取用户的所有书签
   */
  async getUserBookmarks(
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
      this.prisma.bookmark.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
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
      this.prisma.bookmark.count({ where }),
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
   * 检查新闻是否被收藏
   */
  async isBookmarked(
    newsId: string,
    sessionId: string,
    userId?: string,
  ): Promise<boolean> {
    // 先检查 Redis
    const cacheKey = userId
      ? `bookmark:user:${userId}:${newsId}`
      : `bookmark:session:${sessionId}:${newsId}`;

    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return true;
    }

    // 检查数据库
    const bookmark = await this.getBookmark(newsId, sessionId, userId);
    if (bookmark) {
      // 回写到 Redis
      await this.redis.set(cacheKey, JSON.stringify(bookmark), 86400);
      return true;
    }

    return false;
  }

  /**
   * 批量检查书签状态
   */
  async checkMultipleBookmarks(
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

    const bookmarks = await this.prisma.bookmark.findMany({
      where,
      select: { newsId: true },
    });

    const bookmarkedIds = new Set(bookmarks.map((b) => b.newsId));

    const result: Record<string, boolean> = {};
    for (const newsId of newsIds) {
      result[newsId] = bookmarkedIds.has(newsId);
    }

    return result;
  }
}
