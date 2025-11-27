import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RedisService } from './redis.service';

/**
 * 缓存策略配置
 */
export interface CacheConfig {
  defaultTTL: number; // 默认过期时间（秒）
  hotTTL: number; // 热门内容过期时间（秒）
  warmupEnabled: boolean; // 是否启用缓存预热
  degradeEnabled: boolean; // 是否启用降级策略
}

/**
 * 缓存策略服务
 * 提供缓存预热、动态TTL、降级策略等高级功能
 */
@Injectable()
export class CacheStrategyService implements OnModuleInit {
  private readonly logger = new Logger(CacheStrategyService.name);
  private readonly config: CacheConfig;
  private readonly memoryCache: Map<string, { value: any; expireAt: number }> = new Map();
  private memoryCleanupInterval: NodeJS.Timeout | null = null;

  constructor(
    private readonly redisService: RedisService,
  ) {
    this.config = {
      defaultTTL: 1800, // 30 分钟
      hotTTL: 3600, // 1 小时
      warmupEnabled: true,
      degradeEnabled: true,
    };
  }

  async onModuleInit() {
    if (this.config.degradeEnabled) {
      this.startMemoryCleanup();
      this.logger.log('Memory cache fallback enabled');
    }
  }

  /**
   * 智能获取缓存
   * 优先从 Redis 获取，失败时降级到内存缓存
   */
  async get<T = any>(key: string): Promise<T | null> {
    // 1. 尝试从 Redis 获取
    if (this.redisService.isAvailable()) {
      try {
        const value = await this.redisService.get<T>(key);
        if (value !== null) {
          this.logger.debug(`Cache hit from Redis: ${key}`);
          // 同步到内存缓存作为备份
          if (this.config.degradeEnabled) {
            this.setMemoryCache(key, value, this.config.defaultTTL);
          }
          return value;
        }
      } catch (error: any) {
        this.logger.warn(`Redis get failed, falling back to memory: ${error.message}`);
      }
    }

    // 2. 降级到内存缓存
    if (this.config.degradeEnabled) {
      const memValue = this.getMemoryCache<T>(key);
      if (memValue !== null) {
        this.logger.debug(`Cache hit from memory: ${key}`);
        return memValue;
      }
    }

    this.logger.debug(`Cache miss: ${key}`);
    return null;
  }

  /**
   * 智能设置缓存
   * 同时写入 Redis 和内存缓存（双写策略）
   */
  async set(key: string, value: any, ttl?: number): Promise<boolean> {
    const effectiveTTL = ttl || this.config.defaultTTL;
    let success = false;

    // 1. 写入 Redis
    if (this.redisService.isAvailable()) {
      try {
        success = await this.redisService.set(key, value, effectiveTTL);
        if (success) {
          this.logger.debug(`Cache set to Redis: ${key} (TTL: ${effectiveTTL}s)`);
        }
      } catch (error: any) {
        this.logger.warn(`Redis set failed: ${error.message}`);
      }
    }

    // 2. 同时写入内存缓存（降级策略）
    if (this.config.degradeEnabled) {
      this.setMemoryCache(key, value, effectiveTTL);
      success = true; // 至少内存缓存成功
    }

    return success;
  }

  /**
   * 动态 TTL 设置
   * 根据访问频率和重要性自动调整过期时间
   */
  async setWithDynamicTTL(
    key: string,
    value: any,
    options: {
      viewCount?: number;
      impactScore?: number;
      bookmarkCount?: number;
    } = {},
  ): Promise<boolean> {
    const { viewCount = 0, impactScore = 0, bookmarkCount = 0 } = options;

    // 计算热度分数
    const hotScore = viewCount * 1 + impactScore * 10 + bookmarkCount * 5;

    // 根据热度分数动态调整 TTL
    let ttl = this.config.defaultTTL;

    if (hotScore >= 200) {
      // 超热门：2 小时
      ttl = 7200;
    } else if (hotScore >= 100) {
      // 热门：1 小时
      ttl = this.config.hotTTL;
    } else if (hotScore >= 50) {
      // 中等热度：45 分钟
      ttl = 2700;
    }

    this.logger.debug(
      `Dynamic TTL for ${key}: ${ttl}s (hotScore: ${hotScore}, views: ${viewCount}, impact: ${impactScore}, bookmarks: ${bookmarkCount})`,
    );

    return this.set(key, value, ttl);
  }

  /**
   * 缓存预热
   * 应用启动时预加载热门数据
   */
  async warmup(warmupFn: () => Promise<Array<{ key: string; value: any; ttl?: number }>>): Promise<void> {
    if (!this.config.warmupEnabled) {
      this.logger.log('Cache warmup is disabled');
      return;
    }

    this.logger.log('Starting cache warmup...');
    const startTime = Date.now();

    try {
      const items = await warmupFn();
      let successCount = 0;

      for (const item of items) {
        const success = await this.set(item.key, item.value, item.ttl);
        if (success) {
          successCount++;
        }
      }

      const duration = Date.now() - startTime;
      this.logger.log(
        `Cache warmup completed: ${successCount}/${items.length} items loaded in ${duration}ms`,
      );
    } catch (error: any) {
      this.logger.error(`Cache warmup failed: ${error.message}`, error.stack);
    }
  }

  /**
   * 批量预热
   * 用于预加载大量数据
   */
  async batchWarmup(
    items: Array<{ key: string; value: any; ttl?: number }>,
    batchSize: number = 10,
  ): Promise<number> {
    this.logger.log(`Batch warmup starting: ${items.length} items (batch size: ${batchSize})`);
    let successCount = 0;

    // 分批处理，避免一次性操作过多
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const promises = batch.map((item) => this.set(item.key, item.value, item.ttl));
      const results = await Promise.allSettled(promises);

      successCount += results.filter((r) => r.status === 'fulfilled' && r.value === true).length;
    }

    this.logger.log(`Batch warmup completed: ${successCount}/${items.length} items loaded`);
    return successCount;
  }

  /**
   * 内存缓存操作（降级策略）
   */
  private setMemoryCache(key: string, value: any, ttl: number): void {
    const expireAt = Date.now() + ttl * 1000;
    this.memoryCache.set(key, { value, expireAt });
  }

  private getMemoryCache<T>(key: string): T | null {
    const cached = this.memoryCache.get(key);
    if (!cached) {
      return null;
    }

    // 检查是否过期
    if (Date.now() > cached.expireAt) {
      this.memoryCache.delete(key);
      return null;
    }

    return cached.value as T;
  }

  /**
   * 定期清理过期的内存缓存
   */
  private startMemoryCleanup(): void {
    this.memoryCleanupInterval = setInterval(() => {
      const now = Date.now();
      let cleanedCount = 0;

      for (const [key, cached] of this.memoryCache.entries()) {
        if (now > cached.expireAt) {
          this.memoryCache.delete(key);
          cleanedCount++;
        }
      }

      if (cleanedCount > 0) {
        this.logger.debug(`Memory cache cleanup: removed ${cleanedCount} expired items`);
      }
    }, 60000); // 每分钟清理一次
  }

  /**
   * 获取缓存统计信息
   */
  getStats() {
    return {
      redis: {
        available: this.redisService.isAvailable(),
      },
      memory: {
        size: this.memoryCache.size,
        enabled: this.config.degradeEnabled,
      },
      config: this.config,
    };
  }

  /**
   * 清理资源
   */
  onModuleDestroy() {
    if (this.memoryCleanupInterval) {
      clearInterval(this.memoryCleanupInterval);
    }
    this.memoryCache.clear();
  }
}
