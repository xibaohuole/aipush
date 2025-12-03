import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  Headers,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiHeader } from '@nestjs/swagger';
import { ReadHistoryService } from '../services/read-history.service';

/**
 * 已读记录 API 控制器
 */
@ApiTags('read-history')
@Controller('read-history')
export class ReadHistoryController {
  constructor(private readonly readHistoryService: ReadHistoryService) {}

  /**
   * 标记新闻为已读
   */
  @Post(':newsId')
  @ApiOperation({ summary: '标记新闻为已读' })
  @ApiHeader({ name: 'x-session-id', required: true })
  @ApiHeader({ name: 'x-user-id', required: false })
  async markAsRead(
    @Param('newsId') newsId: string,
    @Headers('x-session-id') sessionId: string,
    @Headers('x-user-id') userId: string | undefined,
    @Body() body: { readDuration?: number; scrollDepth?: number },
  ) {
    const readHistory = await this.readHistoryService.markAsRead(
      newsId,
      sessionId,
      userId,
      body.readDuration,
      body.scrollDepth,
    );
    return {
      success: true,
      data: readHistory,
    };
  }

  /**
   * 获取用户的已读历史
   */
  @Get()
  @ApiOperation({ summary: '获取用户的已读历史' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiHeader({ name: 'x-session-id', required: true })
  @ApiHeader({ name: 'x-user-id', required: false })
  async getUserReadHistory(
    @Headers('x-session-id') sessionId: string,
    @Headers('x-user-id') userId: string | undefined,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    const result = await this.readHistoryService.getUserReadHistory(
      sessionId,
      userId,
      page,
      limit,
    );
    return {
      success: true,
      data: result,
    };
  }

  /**
   * 检查新闻是否已读
   */
  @Get('check/:newsId')
  @ApiOperation({ summary: '检查新闻是否已读' })
  @ApiHeader({ name: 'x-session-id', required: true })
  @ApiHeader({ name: 'x-user-id', required: false })
  async checkReadStatus(
    @Param('newsId') newsId: string,
    @Headers('x-session-id') sessionId: string,
    @Headers('x-user-id') userId?: string,
  ) {
    const isRead = await this.readHistoryService.isRead(newsId, sessionId, userId);
    return {
      success: true,
      data: { isRead },
    };
  }

  /**
   * 批量检查已读状态
   */
  @Post('check-multiple')
  @ApiOperation({ summary: '批量检查已读状态' })
  @ApiHeader({ name: 'x-session-id', required: true })
  @ApiHeader({ name: 'x-user-id', required: false })
  async checkMultipleReadStatus(
    @Headers('x-session-id') sessionId: string,
    @Headers('x-user-id') userId: string | undefined,
    @Query('newsIds') newsIds: string,
  ) {
    const newsIdArray = newsIds.split(',');
    const statuses = await this.readHistoryService.checkMultipleReadStatus(
      newsIdArray,
      sessionId,
      userId,
    );
    return {
      success: true,
      data: statuses,
    };
  }

  /**
   * 获取已读统计
   */
  @Get('stats')
  @ApiOperation({ summary: '获取已读统计' })
  @ApiHeader({ name: 'x-session-id', required: true })
  @ApiHeader({ name: 'x-user-id', required: false })
  async getReadStats(
    @Headers('x-session-id') sessionId: string,
    @Headers('x-user-id') userId?: string,
  ) {
    const stats = await this.readHistoryService.getReadStats(sessionId, userId);
    return {
      success: true,
      data: stats,
    };
  }
}
