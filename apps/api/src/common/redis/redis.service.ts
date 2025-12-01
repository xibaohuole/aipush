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
   * 删除匹配模式的所有键
   * @param pattern 匹配模式，例如 "ai-news:*"
   * @returns 删除的键数量
   */
  async deleteByPattern(pattern: string): Promise<number> {
    if (!this.client || !this.isConnected) {
      return 0;
    }

    try {
      const keys = await this.client.keys(pattern);
      if (keys.length === 0) {
        this.logger.log(`No keys found matching pattern: ${pattern}`);
        return 0;
      }

      await this.client.del(...keys);
      this.logger.log(`Deleted ${keys.length} keys matching pattern: ${pattern}`);
      return keys.length;
    } catch (error: any) {
      this.logger.error(`Failed to delete keys by pattern ${pattern}: ${error.message}`);
      return 0;
    }
  }

  /**
   * 检查 Redis 是否可用
   */
  isAvailable(): boolean {
    return this.client !== null && this.isConnected;
  }

  /**
   * 添加成员到Set集合
   */
  async sAdd(key: string, ...members: string[]): Promise<number> {
    if (!this.client || !this.isConnected) {
      return 0;
    }

    try {
      const result = await this.client.sadd(key, ...members);
      return result;
    } catch (error: any) {
      this.logger.error(`Failed to add to set ${key}: ${error.message}`);
      return 0;
    }
  }

  /**
   * 检查成员是否在Set集合中
   */
  async sIsMember(key: string, member: string): Promise<boolean> {
    if (!this.client || !this.isConnected) {
      return false;
    }

    try {
      const result = await this.client.sismember(key, member);
      return result === 1;
    } catch (error: any) {
      this.logger.error(`Failed to check set membership ${key}: ${error.message}`);
      return false;
    }
  }

  /**
   * 获取Set集合的所有成员
   */
  async sMembers(key: string): Promise<string[]> {
    if (!this.client || !this.isConnected) {
      return [];
    }

    try {
      return await this.client.smembers(key);
    } catch (error: any) {
      this.logger.error(`Failed to get set members ${key}: ${error.message}`);
      return [];
    }
  }

  /**
   * 为键设置过期时间
   */
  async expire(key: string, seconds: number): Promise<boolean> {
    if (!this.client || !this.isConnected) {
      return false;
    }

    try {
      const result = await this.client.expire(key, seconds);
      return result === 1;
    } catch (error: any) {
      this.logger.error(`Failed to set expiry for ${key}: ${error.message}`);
      return false;
    }
  }

  /**
   * 删除指定键
   */
  async del(key: string): Promise<boolean> {
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

  // ========== 监控和统计相关方法 ==========

  /**
   * 获取Redis服务器信息
   */
  async getInfo(section?: string): Promise<string> {
    if (!this.client || !this.isConnected) {
      return 'Redis is not connected';
    }

    try {
      return section ? await this.client.info(section) : await this.client.info();
    } catch (error: any) {
      this.logger.error(`Failed to get Redis info: ${error.message}`);
      return '';
    }
  }

  /**
   * 获取Redis统计信息（结构化）
   */
  async getStats(): Promise<{
    connected: boolean;
    memory: {
      used: string;
      peak: string;
      fragmentation: number;
    };
    stats: {
      totalKeys: number;
      commandsProcessed: number;
      connectionsReceived: number;
    };
    keyspace: Record<string, any>;
  }> {
    if (!this.client || !this.isConnected) {
      return {
        connected: false,
        memory: { used: '0', peak: '0', fragmentation: 0 },
        stats: { totalKeys: 0, commandsProcessed: 0, connectionsReceived: 0 },
        keyspace: {},
      };
    }

    try {
      const info = await this.client.info();
      const dbSize = await this.client.dbsize();

      // 解析INFO输出
      const memoryUsed = this.extractInfoValue(info, 'used_memory_human');
      const memoryPeak = this.extractInfoValue(info, 'used_memory_peak_human');
      const fragmentation = parseFloat(this.extractInfoValue(info, 'mem_fragmentation_ratio') || '1');
      const commandsProcessed = parseInt(this.extractInfoValue(info, 'total_commands_processed') || '0');
      const connectionsReceived = parseInt(this.extractInfoValue(info, 'total_connections_received') || '0');

      return {
        connected: true,
        memory: {
          used: memoryUsed || '0',
          peak: memoryPeak || '0',
          fragmentation,
        },
        stats: {
          totalKeys: dbSize,
          commandsProcessed,
          connectionsReceived,
        },
        keyspace: await this.getKeyspaceStats(),
      };
    } catch (error: any) {
      this.logger.error(`Failed to get Redis stats: ${error.message}`);
      return {
        connected: false,
        memory: { used: '0', peak: '0', fragmentation: 0 },
        stats: { totalKeys: 0, commandsProcessed: 0, connectionsReceived: 0 },
        keyspace: {},
      };
    }
  }

  /**
   * 获取各类缓存键的统计
   */
  async getKeyspaceStats(): Promise<Record<string, number>> {
    if (!this.client || !this.isConnected) {
      return {};
    }

    try {
      const patterns = [
        'ai-news:*',
        'source-health:*',
        'cache:*',
        'news:*',
      ];

      const stats: Record<string, number> = {};

      for (const pattern of patterns) {
        const keys = await this.client.keys(pattern);
        const prefix = pattern.replace(':*', '');
        stats[prefix] = keys.length;
      }

      return stats;
    } catch (error: any) {
      this.logger.error(`Failed to get keyspace stats: ${error.message}`);
      return {};
    }
  }

  /**
   * 从INFO输出中提取值
   */
  private extractInfoValue(info: string, key: string): string {
    const regex = new RegExp(`${key}:(.+)`);
    const match = info.match(regex);
    return match ? match[1].trim() : '';
  }

  /**
   * 清理过期的缓存
   */
  async cleanupExpiredKeys(pattern: string): Promise<number> {
    if (!this.client || !this.isConnected) {
      return 0;
    }

    try {
      const keys = await this.client.keys(pattern);
      let cleanedCount = 0;

      for (const key of keys) {
        const ttl = await this.client.ttl(key);
        // 如果TTL为-1（永不过期但我们期望有过期时间）或-2（已过期）
        if (ttl === -2) {
          await this.client.del(key);
          cleanedCount++;
        }
      }

      if (cleanedCount > 0) {
        this.logger.log(`Cleaned up ${cleanedCount} expired keys matching ${pattern}`);
      }

      return cleanedCount;
    } catch (error: any) {
      this.logger.error(`Failed to cleanup expired keys: ${error.message}`);
      return 0;
    }
  }

  /**
   * 获取特定pattern的所有键及其TTL
   */
  async getKeysWithTTL(pattern: string, limit: number = 100): Promise<Array<{ key: string; ttl: number }>> {
    if (!this.client || !this.isConnected) {
      return [];
    }

    try {
      const keys = await this.client.keys(pattern);
      const limitedKeys = keys.slice(0, limit);
      const results: Array<{ key: string; ttl: number }> = [];

      for (const key of limitedKeys) {
        const ttl = await this.client.ttl(key);
        results.push({ key, ttl });
      }

      return results;
    } catch (error: any) {
      this.logger.error(`Failed to get keys with TTL: ${error.message}`);
      return [];
    }
  }
}
