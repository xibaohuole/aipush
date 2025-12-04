import { Injectable, Logger } from "@nestjs/common";
import { RedisService } from "../../../common/redis/redis.service";
import {
  getEnabledSources,
  NEWS_SOURCES,
  NewsSource,
} from "../config/news-sources.config";
import axios from "axios";

/**
 * RSS源健康状态
 */
export interface SourceHealthStatus {
  sourceId: string;
  sourceName: string;
  isHealthy: boolean;
  lastCheckTime: Date;
  consecutiveFailures: number;
  lastError?: string;
  responseTime?: number;
}

/**
 * RSS源健康检查服务
 */
@Injectable()
export class SourceHealthService {
  private readonly logger = new Logger(SourceHealthService.name);
  private readonly HEALTH_KEY_PREFIX = "source-health:";
  private readonly MAX_CONSECUTIVE_FAILURES = 3; // 连续失败3次后禁用
  private readonly HEALTH_CHECK_TIMEOUT = 10000; // 10秒超时

  constructor(private readonly redisService: RedisService) {}

  /**
   * 检查单个源的健康状态
   */
  async checkSourceHealth(source: NewsSource): Promise<SourceHealthStatus> {
    const startTime = Date.now();
    let isHealthy = false;
    let lastError: string | undefined;
    let responseTime: number | undefined;

    try {
      // 尝试访问RSS源
      const response = await axios.get(source.url, {
        timeout: this.HEALTH_CHECK_TIMEOUT,
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; AINewsBot/1.0)",
        },
        validateStatus: (status) => status < 500, // 只要不是5xx就算成功
      });

      responseTime = Date.now() - startTime;
      isHealthy = response.status === 200;

      if (!isHealthy) {
        lastError = `HTTP ${response.status}`;
      }
    } catch (error: any) {
      responseTime = Date.now() - startTime;
      isHealthy = false;
      lastError =
        error.code === "ECONNABORTED"
          ? "请求超时"
          : error.message?.substring(0, 100) || "未知错误";

      this.logger.warn(
        `源健康检查失败: ${source.name} - ${lastError} (${responseTime}ms)`,
      );
    }

    // 获取历史失败次数
    const healthKey = `${this.HEALTH_KEY_PREFIX}${source.id}`;
    const previousData =
      await this.redisService.get<SourceHealthStatus>(healthKey);

    const consecutiveFailures = isHealthy
      ? 0
      : (previousData?.consecutiveFailures || 0) + 1;

    const healthStatus: SourceHealthStatus = {
      sourceId: source.id,
      sourceName: source.name,
      isHealthy,
      lastCheckTime: new Date(),
      consecutiveFailures,
      lastError,
      responseTime,
    };

    // 保存健康状态到Redis（保留30天）
    await this.redisService.set(healthKey, healthStatus, 30 * 24 * 60 * 60);

    // 如果连续失败次数超过阈值，记录警告
    if (consecutiveFailures >= this.MAX_CONSECUTIVE_FAILURES) {
      this.logger.error(
        `⚠️ 源已连续失败${consecutiveFailures}次，建议禁用: ${source.name} (${source.url})`,
      );
    }

    return healthStatus;
  }

  /**
   * 检查所有启用源的健康状态
   */
  async checkAllSourcesHealth(): Promise<{
    total: number;
    healthy: number;
    unhealthy: number;
    warnings: number;
    results: SourceHealthStatus[];
  }> {
    this.logger.log("开始RSS源健康检查...");

    const sources = getEnabledSources();
    const results: SourceHealthStatus[] = [];

    // 串行检查，避免并发过多
    for (const source of sources) {
      const status = await this.checkSourceHealth(source);
      results.push(status);

      // 每次检查之间稍微延迟，避免被识别为爬虫
      await this.sleep(500);
    }

    const healthy = results.filter((r) => r.isHealthy).length;
    const unhealthy = results.filter((r) => !r.isHealthy).length;
    const warnings = results.filter(
      (r) => r.consecutiveFailures >= this.MAX_CONSECUTIVE_FAILURES,
    ).length;

    this.logger.log(
      `健康检查完成: ${healthy}/${sources.length} 健康, ${unhealthy} 不健康, ${warnings} 需要关注`,
    );

    return {
      total: sources.length,
      healthy,
      unhealthy,
      warnings,
      results,
    };
  }

  /**
   * 获取单个源的健康状态（从缓存）
   */
  async getSourceHealth(sourceId: string): Promise<SourceHealthStatus | null> {
    const healthKey = `${this.HEALTH_KEY_PREFIX}${sourceId}`;
    return await this.redisService.get<SourceHealthStatus>(healthKey);
  }

  /**
   * 获取所有源的健康状态（从缓存）
   */
  async getAllSourcesHealthStatus(): Promise<SourceHealthStatus[]> {
    const sources = NEWS_SOURCES;
    const statuses: SourceHealthStatus[] = [];

    for (const source of sources) {
      const status = await this.getSourceHealth(source.id);
      if (status) {
        statuses.push(status);
      }
    }

    return statuses;
  }

  /**
   * 获取需要关注的源（连续失败次数超过阈值）
   */
  async getProblematicSources(): Promise<SourceHealthStatus[]> {
    const allStatuses = await this.getAllSourcesHealthStatus();
    return allStatuses.filter(
      (s) => s.consecutiveFailures >= this.MAX_CONSECUTIVE_FAILURES,
    );
  }

  /**
   * 清除某个源的健康状态（用于重置）
   */
  async resetSourceHealth(sourceId: string): Promise<void> {
    const healthKey = `${this.HEALTH_KEY_PREFIX}${sourceId}`;
    await this.redisService.del(healthKey);
    this.logger.log(`已重置源健康状态: ${sourceId}`);
  }

  /**
   * 生成健康报告
   */
  async generateHealthReport(): Promise<string> {
    const statuses = await this.getAllSourcesHealthStatus();

    if (statuses.length === 0) {
      return "暂无健康检查数据，请先运行健康检查。";
    }

    const healthy = statuses.filter((s) => s.isHealthy);
    const unhealthy = statuses.filter((s) => !s.isHealthy);
    const warnings = statuses.filter(
      (s) => s.consecutiveFailures >= this.MAX_CONSECUTIVE_FAILURES,
    );

    let report = "=== RSS源健康报告 ===\n\n";
    report += `总源数: ${statuses.length}\n`;
    report += `健康: ${healthy.length} (${((healthy.length / statuses.length) * 100).toFixed(1)}%)\n`;
    report += `不健康: ${unhealthy.length}\n`;
    report += `需要关注: ${warnings.length}\n\n`;

    if (warnings.length > 0) {
      report += "⚠️ 需要关注的源（连续失败≥3次）:\n";
      warnings.forEach((w) => {
        report += `  - ${w.sourceName} (${w.sourceId})\n`;
        report += `    连续失败: ${w.consecutiveFailures}次\n`;
        report += `    最后错误: ${w.lastError || "N/A"}\n`;
        report += `    上次检查: ${w.lastCheckTime}\n\n`;
      });
    }

    if (unhealthy.length > 0 && unhealthy.length <= 10) {
      report += "❌ 不健康的源:\n";
      unhealthy.forEach((u) => {
        report += `  - ${u.sourceName}: ${u.lastError || "未知错误"}\n`;
      });
    }

    return report;
  }

  /**
   * 辅助函数：延迟
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
