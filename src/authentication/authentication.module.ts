import { Module } from '@nestjs/common';
import { AuthenticationService } from './services/authentication.service';
import { AuthenticationController } from './controllers/authentication.controller';
import { UserModule } from '../user/user.module';

@Module({
	imports: [UserModule],
	providers: [AuthenticationService],
	controllers: [AuthenticationController],
})
export class AuthenticationModule {}
