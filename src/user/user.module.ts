import { Module } from '@nestjs/common';
import { UserService } from './services/user.service';
import { UserController } from './controllers/user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { UserRepository } from './repositories/user.repository';
import { RedisModule } from '../configs/redis.module';

@Module({
	imports: [TypeOrmModule.forFeature([UserEntity]), RedisModule],
	providers: [UserService, UserRepository],
	controllers: [UserController],
	exports: [UserService],
})
export class UserModule {}
