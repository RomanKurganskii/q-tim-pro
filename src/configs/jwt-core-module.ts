import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ENV } from '../common/consts/env';

@Global()
@Module({
	imports: [
		JwtModule.registerAsync({
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => ({
				global: true,
				secret: configService.get<string>(ENV.JWT_SECRET),
				signOptions: {
					expiresIn: `${configService.get<number>(ENV.JWT_EXPIRATION_TIME) ?? 3600}s`,
				},
			}),
		}),
	],
	exports: [JwtModule],
})
export class JwtCoreModule {}
