import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Headers,
  ParseIntPipe,
  DefaultValuePipe,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiQuery, ApiHeader } from "@nestjs/swagger";
import { BookmarkService } from "../services/bookmark.service";

/**
 * 书签 API 控制器
 */
@ApiTags("bookmarks")
@Controller("bookmarks")
export class BookmarkController {
  constructor(private readonly bookmarkService: BookmarkService) {}

  /**
   * 添加书签
   */
  @Post(":newsId")
  @ApiOperation({ summary: "添加书签" })
  @ApiHeader({ name: "x-session-id", required: true })
  @ApiHeader({ name: "x-user-id", required: false })
  async addBookmark(
    @Param("newsId") newsId: string,
    @Headers("x-session-id") sessionId: string,
    @Headers("x-user-id") userId?: string,
  ) {
    const bookmark = await this.bookmarkService.addBookmark(
      newsId,
      sessionId,
      userId,
    );
    return {
      success: true,
      data: bookmark,
    };
  }

  /**
   * 移除书签
   */
  @Delete(":newsId")
  @ApiOperation({ summary: "移除书签" })
  @ApiHeader({ name: "x-session-id", required: true })
  @ApiHeader({ name: "x-user-id", required: false })
  async removeBookmark(
    @Param("newsId") newsId: string,
    @Headers("x-session-id") sessionId: string,
    @Headers("x-user-id") userId?: string,
  ) {
    await this.bookmarkService.removeBookmark(newsId, sessionId, userId);
    return {
      success: true,
      message: "Bookmark removed",
    };
  }

  /**
   * 获取用户的所有书签
   */
  @Get()
  @ApiOperation({ summary: "获取用户的所有书签" })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiHeader({ name: "x-session-id", required: true })
  @ApiHeader({ name: "x-user-id", required: false })
  async getUserBookmarks(
    @Headers("x-session-id") sessionId: string,
    @Headers("x-user-id") userId: string | undefined,
    @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("limit", new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    const result = await this.bookmarkService.getUserBookmarks(
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
   * 检查新闻是否被收藏
   */
  @Get("check/:newsId")
  @ApiOperation({ summary: "检查新闻是否被收藏" })
  @ApiHeader({ name: "x-session-id", required: true })
  @ApiHeader({ name: "x-user-id", required: false })
  async checkBookmark(
    @Param("newsId") newsId: string,
    @Headers("x-session-id") sessionId: string,
    @Headers("x-user-id") userId?: string,
  ) {
    const isBookmarked = await this.bookmarkService.isBookmarked(
      newsId,
      sessionId,
      userId,
    );
    return {
      success: true,
      data: { isBookmarked },
    };
  }

  /**
   * 批量检查书签状态
   */
  @Post("check-multiple")
  @ApiOperation({ summary: "批量检查书签状态" })
  @ApiHeader({ name: "x-session-id", required: true })
  @ApiHeader({ name: "x-user-id", required: false })
  async checkMultipleBookmarks(
    @Headers("x-session-id") sessionId: string,
    @Headers("x-user-id") userId: string | undefined,
    @Query("newsIds") newsIds: string,
  ) {
    const newsIdArray = newsIds.split(",");
    const statuses = await this.bookmarkService.checkMultipleBookmarks(
      newsIdArray,
      sessionId,
      userId,
    );
    return {
      success: true,
      data: statuses,
    };
  }
}
