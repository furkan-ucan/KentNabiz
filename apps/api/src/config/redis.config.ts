import { RedisModuleOptions } from '@nestjs-modules/ioredis';
import { ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { RedisService } from './redis.service';

export const redisConfig = (configService: ConfigService): RedisModuleOptions => ({
  type: 'single',
  url: `redis://${configService.get('REDIS_HOST')}:${configService.get('REDIS_PORT')}`,
  options: {
    password: configService.get('REDIS_PASSWORD'),
    db: configService.get('REDIS_DB'),
    keyPrefix: configService.get('REDIS_PREFIX'),
    retryStrategy: (times: number): number => {
      return Math.min(times * 50, 2000);
    },
  },
});

@Module({
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
