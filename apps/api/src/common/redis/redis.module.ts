import { Module, Global } from '@nestjs/common';
import { RedisService } from './redis.service';
import { CacheStrategyService } from './cache-strategy.service';

@Global()
@Module({
  providers: [RedisService, CacheStrategyService],
  exports: [RedisService, CacheStrategyService],
})
export class RedisModule {}
