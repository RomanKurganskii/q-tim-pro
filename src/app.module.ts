import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ThrottlerModule } from '@nestjs/throttler';
import { configModuleOptions } from './configs/config-module.options';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './user/user.module';
import { AuthenticationModule } from './authentication/authentication.module';
import { ArticleModule } from './article/article.module';

@Module({
	imports: [
		ConfigModule.forRoot(configModuleOptions),
		DatabaseModule,
		ThrottlerModule.forRoot({
			throttlers: [
				{
					ttl: 60000,
					limit: 1000,
				},
			],
		}),
		UserModule,
		AuthenticationModule,
		ArticleModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
