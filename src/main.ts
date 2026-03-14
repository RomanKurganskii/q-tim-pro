import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express';
import { ENV } from './common/consts/env';
import { setupSwagger } from './configs/setup-swagger';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	const configService: ConfigService = app.get(ConfigService);

	if (configService.get(ENV.NODE_ENV) !== 'prod') {
		setupSwagger(app);
	}

	app.use(json({ limit: '10mb' }));
	app.use(urlencoded({ extended: true, limit: '10mb' }));
	app.useGlobalPipes(
		new ValidationPipe({
			transform: true,
			whitelist: true,
			forbidNonWhitelisted: true,
		}),
	);

	app.enableCors({ origin: `*`, credentials: true });
	const PORT = configService.get<string>(ENV.PORT) ?? '3000';
	app.listen(PORT, () => console.log(`Service started on ${PORT}`));
}
bootstrap();
