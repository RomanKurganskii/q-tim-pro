import { Module } from '@nestjs/common';
import { UserService } from './services/user.service';
import { UserController } from './controllers/user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { UserRepository } from './repositories/user.repository';

@Module({
	imports: [TypeOrmModule.forFeature([UserEntity])],
	providers: [UserService, UserRepository],
	controllers: [UserController],
	exports: [UserService],
})
export class UserModule {}
