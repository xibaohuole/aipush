import { Module, Global } from '@nestjs/common';
import { RedisService } from './redis.service';
import { CacheStrategyService } from './cache-strategy.service';
import { RedisController } from './redis.controller';

@Global()
@Module({
  controllers: [RedisController],
  providers: [RedisService, CacheStrategyService],
  exports: [RedisService, CacheStrategyService],
})
export class RedisModule {}
