import { Module } from '@nestjs/common';
import { ArticleService } from './services/article.service';
import { ArticleController } from './controllers/article.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticleEntity } from './entities/article.entity';
import { UserModule } from '../user/user.module';
import { ArticleRepository } from './repositories/article.repository';
import { RedisModule } from '../configs/redis.module';

@Module({
	imports: [TypeOrmModule.forFeature([ArticleEntity]), UserModule, RedisModule],
	providers: [ArticleService, ArticleRepository],
	controllers: [ArticleController],
})
export class ArticleModule {}
