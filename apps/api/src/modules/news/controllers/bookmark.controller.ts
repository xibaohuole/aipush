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
  BadRequestException,
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
   * 验证 UUID 格式
   */
  private isValidUUID(uuid: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  /**
   * 验证并返回 UUID，如果无效则抛出异常
   */
  private validateUUID(id: string, fieldName: string = "id"): string {
    if (!this.isValidUUID(id)) {
      throw new BadRequestException(
        `Invalid ${fieldName} format. Expected a valid UUID.`,
      );
    }
    return id;
  }

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
    // 验证 UUID 格式
    this.validateUUID(newsId, "news ID");

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
    // 验证 UUID 格式
    this.validateUUID(newsId, "news ID");

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
    // 验证 UUID 格式
    this.validateUUID(newsId, "news ID");

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
    const newsIdArray = newsIds.split(",").filter((id) => id.trim());

    // 验证所有 UUID 格式
    for (const newsId of newsIdArray) {
      this.validateUUID(newsId.trim(), "news ID");
    }

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
