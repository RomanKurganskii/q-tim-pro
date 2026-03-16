import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ENV } from '../common/consts/env';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-ioredis';
import { REDIS_TTL } from '../common/consts/glolbal.const';

@Global()
@Module({
	imports: [
		CacheModule.registerAsync({
			isGlobal: true,
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => ({
				store: redisStore,
				url: `${configService.get<string>(ENV.REDIS_URL)}:${configService.get<number>(ENV.REDIS_PORT)}`,
				ttl: REDIS_TTL,
				max: 200,
			}),
		}),
	],
	exports: [RedisModule],
})
export class RedisModule {}
