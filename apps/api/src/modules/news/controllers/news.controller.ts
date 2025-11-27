import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { RedisService } from '../../../common/redis/redis.service';
import { AIAnalyzerService } from '../services/ai-analyzer.service';

/**
 * 新闻 API 控制器
 * 提供新闻查询和管理接口
 */
@ApiTags('news')
@Controller('news')
export class NewsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
    private readonly aiAnalyzer: AIAnalyzerService,
  ) {}

  /**
   * 获取新闻列表（支持分页和筛选）
   */
  @Get()
  @ApiOperation({ summary: '获取新闻列表' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'region', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  async getNews(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('category') category?: string,
    @Query('region') region?: string,
    @Query('search') search?: string,
  ) {
    const skip = (page - 1) * limit;

    // 构建查询条件
    const where: any = {
      deletedAt: null,
      isApproved: true,
    };

    if (category && category !== 'All') {
      where.category = category;
    }

    if (region && region !== 'All') {
      where.region = region;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { summary: { contains: search, mode: 'insensitive' } },
        { source: { contains: search, mode: 'insensitive' } },
      ];
    }

    // 并行查询数据和总数
    const [items, total] = await Promise.all([
      this.prisma.news.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { isTrending: 'desc' },
          { impactScore: 'desc' },
          { publishedAt: 'desc' },
        ],
        select: {
          id: true,
          title: true,
          summary: true,
          whyItMatters: true,
          source: true,
          sourceUrl: true,
          category: true,
          region: true,
          impactScore: true,
          publishedAt: true,
          isTrending: true,
          viewCount: true,
          bookmarkCount: true,
          tags: true,
        },
      }),
      this.prisma.news.count({ where }),
    ]);

    // TransformInterceptor 会自动包装 {success: true, data: ...}
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
   * 获取单个新闻详情
   */
  @Get(':id')
  @ApiOperation({ summary: '获取新闻详情' })
  async getNewsById(@Param('id') id: string) {
    const news = await this.prisma.news.findUnique({
      where: { id },
    });

    if (!news || news.deletedAt) {
      return {
        success: false,
        error: {
          code: 'NEWS_NOT_FOUND',
          message: 'News not found',
        },
      };
    }

    // 增加浏览次数
    await this.prisma.news.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    return news;
  }

  /**
   * 获取趋势新闻
   */
  @Get('trending/list')
  @ApiOperation({ summary: '获取趋势新闻' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getTrendingNews(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    const items = await this.prisma.news.findMany({
      where: {
        deletedAt: null,
        isApproved: true,
        isTrending: true,
      },
      take: limit,
      orderBy: [
        { impactScore: 'desc' },
        { viewCount: 'desc' },
        { publishedAt: 'desc' },
      ],
      select: {
        id: true,
        title: true,
        summary: true,
        source: true,
        category: true,
        region: true,
        impactScore: true,
        publishedAt: true,
        tags: true,
      },
    });

    return {
      success: true,
      data: items,
    };
  }

  /**
   * 获取分类统计
   */
  @Get('stats/categories')
  @ApiOperation({ summary: '获取分类统计' })
  async getCategoryStats() {
    const stats = await this.prisma.news.groupBy({
      by: ['category'],
      where: {
        deletedAt: null,
        isApproved: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
    });

    return {
      success: true,
      data: stats.map((item) => ({
        category: item.category,
        count: item._count.id,
      })),
    };
  }

  /**
   * 增加书签计数
   */
  @Post(':id/bookmark')
  @ApiOperation({ summary: '增加书签' })
  async addBookmark(@Param('id') id: string) {
    await this.prisma.news.update({
      where: { id },
      data: { bookmarkCount: { increment: 1 } },
    });

    return {
      success: true,
      message: 'Bookmark added',
    };
  }

  /**
   * 减少书签计数
   */
  @Post(':id/unbookmark')
  @ApiOperation({ summary: '移除书签' })
  async removeBookmark(@Param('id') id: string) {
    await this.prisma.news.update({
      where: { id },
      data: { bookmarkCount: { decrement: 1 } },
    });

    return {
      success: true,
      message: 'Bookmark removed',
    };
  }

  /**
   * 使用AI生成实时新闻
   */
  @Get('ai/generate')
  @ApiOperation({ summary: '使用AI生成实时新闻' })
  @ApiQuery({ name: 'count', required: false, type: Number })
  async generateAINews(
    @Query('count', new DefaultValuePipe(8), ParseIntPipe) count: number,
  ) {
    try {
      const newsItems = await this.aiAnalyzer.generateRealtimeNews(count);
      return {
        success: true,
        data: newsItems,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'AI_GENERATION_FAILED',
          message: 'Failed to generate AI news',
        },
      };
    }
  }

  /**
   * 清除AI新闻缓存
   */
  @Delete('cache/ai-news')
  @ApiOperation({ summary: '清除AI新闻缓存' })
  async clearAINewsCache() {
    try {
      const deletedCount = await this.redisService.deleteByPattern('ai-news:*');
      return {
        success: true,
        message: `Successfully cleared ${deletedCount} cached items`,
        data: {
          deletedCount,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'CACHE_CLEAR_FAILED',
          message: 'Failed to clear cache',
        },
      };
    }
  }
}
