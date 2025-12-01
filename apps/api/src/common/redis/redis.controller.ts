import { Controller, Get, Post, Query, HttpCode, HttpStatus, Delete, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { RedisService } from './redis.service';

@ApiTags('Redis Cache')
@Controller('cache')
export class RedisController {
  constructor(
    private readonly redisService: RedisService,
  ) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get Redis cache statistics' })
  @ApiResponse({
    status: 200,
    description: 'Return Redis statistics including memory, keys, and performance metrics',
  })
  async getCacheStats() {
    const stats = await this.redisService.getStats();

    return {
      timestamp: new Date(),
      redis: stats,
      cacheStrategy: {
        description: 'Dual-layer cache: Redis + In-memory fallback',
        ttlStrategy: 'Dynamic TTL based on content hotness',
      },
    };
  }

  @Get('keys')
  @ApiOperation({ summary: 'Get all cached keys by pattern' })
  @ApiQuery({ name: 'pattern', required: false, example: 'ai-news:*' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 100 })
  @ApiResponse({
    status: 200,
    description: 'Return list of keys with their TTL',
  })
  async getKeys(
    @Query('pattern') pattern: string = '*',
    @Query('limit') limit: string = '100',
  ) {
    const keys = await this.redisService.getKeysWithTTL(pattern, parseInt(limit));

    return {
      pattern,
      count: keys.length,
      limit: parseInt(limit),
      keys,
    };
  }

  @Get('keyspace')
  @ApiOperation({ summary: 'Get keyspace statistics by prefix' })
  @ApiResponse({
    status: 200,
    description: 'Return key count grouped by prefix',
  })
  async getKeyspaceStats() {
    const stats = await this.redisService.getKeyspaceStats();

    return {
      timestamp: new Date(),
      keyspace: stats,
      total: Object.values(stats).reduce((sum, count) => sum + count, 0),
    };
  }

  @Get('info')
  @ApiOperation({ summary: 'Get Redis server INFO' })
  @ApiQuery({ name: 'section', required: false, example: 'memory' })
  @ApiResponse({
    status: 200,
    description: 'Return raw Redis INFO output',
  })
  async getInfo(@Query('section') section?: string) {
    const info = await this.redisService.getInfo(section);

    return {
      section: section || 'all',
      info,
    };
  }

  @Post('cleanup')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Clean up expired cache keys' })
  @ApiQuery({ name: 'pattern', required: false, example: 'ai-news:*' })
  @ApiResponse({
    status: 200,
    description: 'Return number of cleaned keys',
  })
  async cleanupCache(@Query('pattern') pattern: string = '*') {
    const cleanedCount = await this.redisService.cleanupExpiredKeys(pattern);

    return {
      pattern,
      cleanedCount,
      message: `Cleaned up ${cleanedCount} expired keys`,
    };
  }

  @Delete('clear/:pattern')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Clear cache by pattern (use with caution)' })
  @ApiResponse({
    status: 200,
    description: 'Return number of deleted keys',
  })
  async clearCacheByPattern(@Param('pattern') pattern: string) {
    const deletedCount = await this.redisService.deleteByPattern(pattern);

    return {
      pattern,
      deletedCount,
      message: `Deleted ${deletedCount} keys matching pattern`,
    };
  }

  @Delete('clear-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Clear ALL cache (DANGEROUS - use with extreme caution)' })
  @ApiResponse({
    status: 200,
    description: 'All cache cleared',
  })
  async clearAllCache() {
    const success = await this.redisService.flushAll();

    return {
      success,
      message: success ? 'All cache cleared successfully' : 'Failed to clear cache',
      warning: 'This action cannot be undone',
    };
  }

  @Get('health')
  @ApiOperation({ summary: 'Check Redis connection health' })
  @ApiResponse({
    status: 200,
    description: 'Return Redis connection status',
  })
  async checkHealth() {
    const isAvailable = this.redisService.isAvailable();

    return {
      redis: {
        connected: isAvailable,
        status: isAvailable ? 'healthy' : 'disconnected',
      },
      timestamp: new Date(),
    };
  }

  @Get('report')
  @ApiOperation({ summary: 'Get comprehensive cache health report' })
  @ApiResponse({
    status: 200,
    description: 'Return detailed cache health report',
  })
  async getCacheReport() {
    const stats = await this.redisService.getStats();
    const keyspace = await this.redisService.getKeyspaceStats();

    const totalKeys = Object.values(keyspace).reduce((sum, count) => sum + count, 0);
    const memoryUsed = stats.memory.used;
    const fragmentation = stats.memory.fragmentation;

    let healthStatus = 'healthy';
    const warnings: string[] = [];

    // 检查内存碎片化
    if (fragmentation > 1.5) {
      healthStatus = 'warning';
      warnings.push(`High memory fragmentation: ${fragmentation.toFixed(2)}`);
    }

    // 检查键数量
    if (totalKeys > 10000) {
      warnings.push(`Large number of keys: ${totalKeys}`);
    }

    const report = `
=== Redis 缓存健康报告 ===

连接状态: ${stats.connected ? '✅ 已连接' : '❌ 未连接'}
健康状态: ${healthStatus === 'healthy' ? '✅ 健康' : '⚠️ 需要关注'}

内存使用:
  当前使用: ${memoryUsed}
  峰值使用: ${stats.memory.peak}
  碎片率: ${fragmentation.toFixed(2)}

键空间统计:
  总键数: ${totalKeys}
${Object.entries(keyspace).map(([prefix, count]) => `  ${prefix}: ${count}`).join('\n')}

性能指标:
  处理命令数: ${stats.stats.commandsProcessed.toLocaleString()}
  接收连接数: ${stats.stats.connectionsReceived.toLocaleString()}

${warnings.length > 0 ? `⚠️ 警告:\n${warnings.map(w => `  - ${w}`).join('\n')}` : '✅ 无警告'}
`;

    return {
      status: healthStatus,
      stats,
      keyspace,
      totalKeys,
      warnings,
      report,
      timestamp: new Date(),
    };
  }
}
