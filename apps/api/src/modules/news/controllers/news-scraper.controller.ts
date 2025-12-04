import {
  Controller,
  Get,
  Post,
  Param,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { NewsScraperService } from "../services/news-scraper.service";
import { NewsScraperScheduler } from "../schedulers/news-scraper.scheduler";
import { SourceHealthService } from "../services/source-health.service";

@ApiTags("News Scraper")
@Controller("news/scraper")
export class NewsScraperController {
  constructor(
    private readonly newsScraperService: NewsScraperService,
    private readonly newsScraperScheduler: NewsScraperScheduler,
    private readonly sourceHealthService: SourceHealthService,
  ) {}

  @Post("trigger")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Manually trigger news scraping" })
  @ApiResponse({
    status: 200,
    description: "Scraping completed successfully",
  })
  @ApiResponse({
    status: 409,
    description: "Scraping already in progress",
  })
  async triggerScraping() {
    return this.newsScraperScheduler.triggerManualScraping();
  }

  @Get("status")
  @ApiOperation({ summary: "Get scraping status" })
  @ApiResponse({
    status: 200,
    description: "Return scraping status",
  })
  getScrapingStatus() {
    return this.newsScraperScheduler.getScrapingStatus();
  }

  @Get("stats")
  @ApiOperation({ summary: "Get scraping statistics" })
  @ApiResponse({
    status: 200,
    description: "Return scraping statistics",
  })
  async getScrapingStats() {
    return this.newsScraperService.getScrapingStats();
  }

  @Post("source/:sourceId")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Scrape a single news source" })
  @ApiResponse({
    status: 200,
    description: "Source scraped successfully",
  })
  @ApiResponse({
    status: 404,
    description: "News source not found",
  })
  async scrapeSingleSource(@Param("sourceId") sourceId: string) {
    const newCount = await this.newsScraperService.scrapeSingleSource(sourceId);

    return {
      sourceId,
      newItemsCount: newCount,
      message: `Successfully scraped ${newCount} new items`,
    };
  }

  @Post("trending/update")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Update trending news" })
  @ApiResponse({
    status: 200,
    description: "Trending news updated successfully",
  })
  async updateTrending() {
    await this.newsScraperService.updateTrendingNews();

    return {
      message: "Trending news updated successfully",
    };
  }

  @Post("cleanup")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Clean up old news" })
  @ApiResponse({
    status: 200,
    description: "Old news cleaned up successfully",
  })
  async cleanupOldNews() {
    const deletedCount = await this.newsScraperService.cleanOldNews(30);

    return {
      deletedCount,
      message: `Cleaned up ${deletedCount} old news items`,
    };
  }

  @Post("cleanup/all")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Delete ALL news (use with caution)" })
  @ApiResponse({
    status: 200,
    description: "All news deleted successfully",
  })
  async deleteAllNews() {
    const deletedCount = await this.newsScraperService.cleanOldNews(-1);

    return {
      deletedCount,
      message: `Deleted all ${deletedCount} news items`,
    };
  }

  // ========== RSS源健康检查 ==========

  @Post("health/check")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Manually trigger RSS source health check" })
  @ApiResponse({
    status: 200,
    description: "Health check completed successfully",
  })
  async triggerHealthCheck() {
    return this.newsScraperScheduler.triggerHealthCheck();
  }

  @Get("health/status")
  @ApiOperation({ summary: "Get all RSS sources health status" })
  @ApiResponse({
    status: 200,
    description: "Return health status for all sources",
  })
  async getHealthStatus() {
    const statuses = await this.sourceHealthService.getAllSourcesHealthStatus();

    const healthy = statuses.filter((s) => s.isHealthy).length;
    const unhealthy = statuses.filter((s) => !s.isHealthy).length;
    const warnings = statuses.filter((s) => s.consecutiveFailures >= 3).length;

    return {
      summary: {
        total: statuses.length,
        healthy,
        unhealthy,
        warnings,
      },
      sources: statuses,
    };
  }

  @Get("health/report")
  @ApiOperation({ summary: "Get RSS sources health report" })
  @ApiResponse({
    status: 200,
    description: "Return health report in text format",
  })
  async getHealthReport() {
    const report = await this.sourceHealthService.generateHealthReport();

    return {
      report,
      timestamp: new Date(),
    };
  }

  @Get("health/problematic")
  @ApiOperation({
    summary: "Get problematic RSS sources (consecutive failures >= 3)",
  })
  @ApiResponse({
    status: 200,
    description: "Return sources with high failure rates",
  })
  async getProblematicSources() {
    const problematic = await this.sourceHealthService.getProblematicSources();

    return {
      count: problematic.length,
      sources: problematic,
    };
  }

  @Post("health/reset/:sourceId")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Reset health status for a specific source" })
  @ApiResponse({
    status: 200,
    description: "Health status reset successfully",
  })
  async resetSourceHealth(@Param("sourceId") sourceId: string) {
    await this.sourceHealthService.resetSourceHealth(sourceId);

    return {
      message: `Health status reset for source: ${sourceId}`,
    };
  }
}
