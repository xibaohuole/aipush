import { Controller, Get, Post, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { NewsScraperService } from '../services/news-scraper.service';
import { NewsScraperScheduler } from '../schedulers/news-scraper.scheduler';

@ApiTags('News Scraper')
@Controller('news/scraper')
export class NewsScraperController {
  constructor(
    private readonly newsScraperService: NewsScraperService,
    private readonly newsScraperScheduler: NewsScraperScheduler,
  ) {}

  @Post('trigger')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Manually trigger news scraping' })
  @ApiResponse({
    status: 200,
    description: 'Scraping completed successfully',
  })
  @ApiResponse({
    status: 409,
    description: 'Scraping already in progress',
  })
  async triggerScraping() {
    return this.newsScraperScheduler.triggerManualScraping();
  }

  @Get('status')
  @ApiOperation({ summary: 'Get scraping status' })
  @ApiResponse({
    status: 200,
    description: 'Return scraping status',
  })
  getScrapingStatus() {
    return this.newsScraperScheduler.getScrapingStatus();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get scraping statistics' })
  @ApiResponse({
    status: 200,
    description: 'Return scraping statistics',
  })
  async getScrapingStats() {
    return this.newsScraperService.getScrapingStats();
  }

  @Post('source/:sourceId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Scrape a single news source' })
  @ApiResponse({
    status: 200,
    description: 'Source scraped successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'News source not found',
  })
  async scrapeSingleSource(@Param('sourceId') sourceId: string) {
    const newCount = await this.newsScraperService.scrapeSingleSource(sourceId);

    return {
      sourceId,
      newItemsCount: newCount,
      message: `Successfully scraped ${newCount} new items`,
    };
  }

  @Post('trending/update')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update trending news' })
  @ApiResponse({
    status: 200,
    description: 'Trending news updated successfully',
  })
  async updateTrending() {
    await this.newsScraperService.updateTrendingNews();

    return {
      message: 'Trending news updated successfully',
    };
  }

  @Post('cleanup')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Clean up old news' })
  @ApiResponse({
    status: 200,
    description: 'Old news cleaned up successfully',
  })
  async cleanupOldNews() {
    const deletedCount = await this.newsScraperService.cleanOldNews(30);

    return {
      deletedCount,
      message: `Cleaned up ${deletedCount} old news items`,
    };
  }
}
