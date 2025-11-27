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
    const redisHost = this.configService.get<string>('REDIS_HOST');
    const redisPort = this.configService.get<number>('REDIS_PORT', 6379);

    // 如果没有配置 Redis，使用内存模式（开发环境）
    if (!redisHost) {
      this.logger.warn('Redis not configured, caching will be disabled');
      return;
    }

    try {
      this.client = new Redis({
        host: redisHost,
        port: redisPort,
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        lazyConnect: false,
      });

      this.client.on('connect', () => {
        this.logger.log(`Connected to Redis at ${redisHost}:${redisPort}`);
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
      this.logger.log('Redis connection established successfully');
    } catch (error: any) {
      this.logger.error(`Failed to connect to Redis: ${error.message}`);
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
