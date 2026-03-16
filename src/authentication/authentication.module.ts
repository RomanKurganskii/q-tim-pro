import { Module } from '@nestjs/common';
import { AuthenticationService } from './services/authentication.service';
import { AuthenticationController } from './controllers/authentication.controller';
import { UserModule } from '../user/user.module';
import { JwtCoreModule } from '../configs/jwt-core-module';

@Module({
	imports: [UserModule, JwtCoreModule],
	providers: [AuthenticationService],
	controllers: [AuthenticationController],
})
export class AuthenticationModule {}
