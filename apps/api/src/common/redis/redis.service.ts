import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis | null = null;
  private isConnected = false;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    // 支持两种配置方式：
    // 1. REDIS_URL - 完整的 Redis 连接字符串（推荐）
    // 2. REDIS_HOST + REDIS_PORT - 分开配置
    const redisUrl = this.configService.get<string>('REDIS_URL');
    const redisHost = this.configService.get<string>('REDIS_HOST');
    const redisPort = this.configService.get<number>('REDIS_PORT', 6379);

    // 如果没有配置 Redis，使用内存模式（开发环境）
    if (!redisUrl && !redisHost) {
      this.logger.warn('Redis not configured, caching will be disabled');
      return;
    }

    try {
      // 如果提供了完整的 URL，使用 URL 连接
      if (redisUrl) {
        this.client = new Redis(redisUrl, {
          retryStrategy: (times) => {
            if (times > 3) {
              this.logger.warn('Redis connection failed after 3 retries, disabling cache');
              return null; // 停止重试
            }
            const delay = Math.min(times * 1000, 3000);
            return delay;
          },
          maxRetriesPerRequest: 3,
          enableReadyCheck: true,
          lazyConnect: false,
        });
        this.logger.log(`Connecting to Redis using URL: ${redisUrl.replace(/:[^:@]+@/, ':****@')}`);
      } else {
        // 否则使用 host + port
        this.client = new Redis({
          host: redisHost,
          port: redisPort,
          retryStrategy: (times) => {
            if (times > 3) {
              this.logger.warn('Redis connection failed after 3 retries, disabling cache');
              return null; // 停止重试
            }
            const delay = Math.min(times * 1000, 3000);
            return delay;
          },
          maxRetriesPerRequest: 3,
          enableReadyCheck: true,
          lazyConnect: false,
        });
        this.logger.log(`Connecting to Redis at ${redisHost}:${redisPort}`);
      }

      this.client.on('connect', () => {
        this.logger.log('✅ Redis connection established successfully');
        this.isConnected = true;
      });

      this.client.on('error', (error) => {
        this.logger.error(`Redis connection error: ${error.message}`);
        this.isConnected = false;
      });

      this.client.on('close', () => {
        this.logger.warn('Redis connection closed');
        this.isConnected = false;
      });

      await this.client.ping();
    } catch (error: any) {
      this.logger.error(`Failed to connect to Redis: ${error.message}`);
      this.logger.warn('Continuing without Redis cache');
      this.client = null;
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit();
      this.logger.log('Redis connection closed');
    }
  }

  /**
   * 获取缓存
   */
  async get<T = any>(key: string): Promise<T | null> {
    if (!this.client || !this.isConnected) {
      return null;
    }

    try {
      const value = await this.client.get(key);
      if (!value) {
        return null;
      }
      return JSON.parse(value) as T;
    } catch (error: any) {
      this.logger.error(`Failed to get key ${key}: ${error.message}`);
      return null;
    }
  }

  /**
   * 设置缓存
   * @param key 键
   * @param value 值
   * @param ttl 过期时间（秒），默认 1800 秒（30分钟）
   */
  async set(key: string, value: any, ttl: number = 1800): Promise<boolean> {
    if (!this.client || !this.isConnected) {
      return false;
    }

    try {
      const serialized = JSON.stringify(value);
      await this.client.setex(key, ttl, serialized);
      return true;
    } catch (error: any) {
      this.logger.error(`Failed to set key ${key}: ${error.message}`);
      return false;
    }
  }

  /**
   * 删除缓存
   */
  async delete(key: string): Promise<boolean> {
    if (!this.client || !this.isConnected) {
      return false;
    }

    try {
      await this.client.del(key);
      return true;
    } catch (error: any) {
      this.logger.error(`Failed to delete key ${key}: ${error.message}`);
      return false;
    }
  }

  /**
   * 检查键是否存在
   */
  async exists(key: string): Promise<boolean> {
    if (!this.client || !this.isConnected) {
      return false;
    }

    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error: any) {
      this.logger.error(`Failed to check existence of key ${key}: ${error.message}`);
      return false;
    }
  }

  /**
   * 清除所有缓存
   */
  async flushAll(): Promise<boolean> {
    if (!this.client || !this.isConnected) {
      return false;
    }

    try {
      await this.client.flushall();
      this.logger.log('All cache cleared');
      return true;
    } catch (error: any) {
      this.logger.error(`Failed to flush all: ${error.message}`);
      return false;
    }
  }

  /**
   * 检查 Redis 是否可用
   */
  isAvailable(): boolean {
    return this.client !== null && this.isConnected;
  }
}
