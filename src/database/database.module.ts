import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { ENV } from '../common/consts/env';
import { PROD_NODE_ENV_NAME } from '../common/consts/glolbal.const';

@Module({
	imports: [
		TypeOrmModule.forRootAsync({
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => ({
				type: 'postgres',
				host: configService.get<string>(ENV.POSTGRES_HOST),
				port: configService.get<number>(ENV.POSTGRES_PORT),
				username: configService.get<string>(ENV.POSTGRES_USER),
				password: configService.get<string>(ENV.POSTGRES_PASSWORD),
				database: configService.get<string>(ENV.POSTGRES_DB),
				entities: [__dirname + '/../**/*.entity{.ts,.js}'],
				migrations: [__dirname + '/migrations/*.ts'],
				synchronize: configService.get<string>('NODE_ENV')?.toLowerCase() !== PROD_NODE_ENV_NAME,
			}),
		}),
	],
})
export class DatabaseModule {}
