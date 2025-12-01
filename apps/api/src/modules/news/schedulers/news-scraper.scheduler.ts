import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NewsScraperService } from '../services/news-scraper.service';
import { SourceHealthService } from '../services/source-health.service';

/**
 * 新闻爬取定时任务调度器
 */
@Injectable()
export class NewsScraperScheduler {
  private readonly logger = new Logger(NewsScraperScheduler.name);
  private isScrapingInProgress = false;

  constructor(
    private readonly newsScraperService: NewsScraperService,
    private readonly sourceHealthService: SourceHealthService,
  ) {}

  /**
   * 每小时执行一次新闻爬取
   * Cron: 0 * * * * (每小时的第0分钟)
   */
  @Cron(CronExpression.EVERY_HOUR)
  async handleHourlyScraping() {
    if (this.isScrapingInProgress) {
      this.logger.warn('Scraping already in progress, skipping...');
      return;
    }

    this.isScrapingInProgress = true;

    try {
      this.logger.log('Starting scheduled news scraping...');

      const stats = await this.newsScraperService.scrapeNews();

      this.logger.log(
        `Scheduled scraping completed: ${JSON.stringify(stats)}`
      );
    } catch (error: any) {
      this.logger.error(
        `Scheduled scraping failed: ${error.message}`,
        error.stack
      );
    } finally {
      this.isScrapingInProgress = false;
    }
  }

  /**
   * 每天凌晨3点更新趋势新闻
   * Cron: 0 3 * * * (每天3:00 AM)
   */
  @Cron('0 3 * * *')
  async handleDailyTrendingUpdate() {
    try {
      this.logger.log('Updating trending news...');

      await this.newsScraperService.updateTrendingNews();

      this.logger.log('Trending news updated successfully');
    } catch (error: any) {
      this.logger.error(
        `Failed to update trending news: ${error.message}`,
        error.stack
      );
    }
  }

  /**
   * 每周日凌晨2点清理旧新闻
   * Cron: 0 2 * * 0 (每周日2:00 AM)
   */
  @Cron('0 2 * * 0')
  async handleWeeklyCleanup() {
    try {
      this.logger.log('Cleaning old news...');

      const deletedCount = await this.newsScraperService.cleanOldNews(30);

      this.logger.log(`Cleaned ${deletedCount} old news items`);
    } catch (error: any) {
      this.logger.error(
        `Failed to clean old news: ${error.message}`,
        error.stack
      );
    }
  }

  /**
   * 手动触发爬取（用于测试或管理员操作）
   */
  async triggerManualScraping(): Promise<any> {
    if (this.isScrapingInProgress) {
      throw new Error('Scraping is already in progress');
    }

    this.isScrapingInProgress = true;

    try {
      this.logger.log('Manual scraping triggered');

      const stats = await this.newsScraperService.scrapeNews();

      this.logger.log(`Manual scraping completed: ${JSON.stringify(stats)}`);

      return stats;
    } finally {
      this.isScrapingInProgress = false;
    }
  }

  /**
   * 获取爬取状态
   */
  getScrapingStatus(): {
    isInProgress: boolean;
    lastRun?: Date;
  } {
    return {
      isInProgress: this.isScrapingInProgress,
    };
  }

  /**
   * 每周一凌晨1点检查RSS源健康状态
   * Cron: 0 1 * * 1 (每周一1:00 AM)
   */
  @Cron('0 1 * * 1')
  async handleWeeklyHealthCheck() {
    try {
      this.logger.log('开始每周RSS源健康检查...');

      const result = await this.sourceHealthService.checkAllSourcesHealth();

      this.logger.log(
        `健康检查完成: ${result.healthy}/${result.total} 健康, ${result.warnings} 个需要关注`
      );

      // 如果有需要关注的源，生成报告
      if (result.warnings > 0) {
        const report = await this.sourceHealthService.generateHealthReport();
        this.logger.warn(`健康报告:\n${report}`);
      }
    } catch (error: any) {
      this.logger.error(
        `RSS源健康检查失败: ${error.message}`,
        error.stack
      );
    }
  }

  /**
   * 手动触发健康检查（用于测试或管理员操作）
   */
  async triggerHealthCheck(): Promise<any> {
    this.logger.log('手动触发健康检查');
    const result = await this.sourceHealthService.checkAllSourcesHealth();
    const report = await this.sourceHealthService.generateHealthReport();

    return {
      stats: result,
      report,
    };
  }
}
