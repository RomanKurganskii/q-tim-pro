import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthenticationService } from '../services/authentication.service';
import { UserEntity } from '../../user/entities/user.entity';
import { UserApiResponse } from '../../user/api-responses/user.api-reponse';
import { CreateUserDto } from '../../user/dtos/create-user.dto';
import { ApiBodyOperation } from '../../common/swagger-decorators/api-body-operation.swagger-decorator';
import { TokenApiResponse } from '../api-responses/token.api-response';
import { SignInDto } from '../dtos/sign-in.dto';
import { UserFromRequest } from '../interfaces/user-from-request.interface';
import { AuthenticationGuard } from '../guards/authentication.guard';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';

@Controller('authentication')
export class AuthenticationController {
	constructor(private readonly authenticationService: AuthenticationService) {}

	@ApiBodyOperation('Регистрация', CreateUserDto, UserApiResponse, 'Данные для регистрации')
	@Post('/registration')
	async registration(@Body() dto: CreateUserDto): Promise<UserEntity> {
		return this.authenticationService.registration(dto);
	}

	@ApiBodyOperation('Вход', SignInDto, TokenApiResponse, 'Данные для входа')
	@Post('/sign-in')
	async signIn(@Body() dto: SignInDto): Promise<TokenApiResponse> {
		return this.authenticationService.signIn(dto);
	}

	@ApiOperation({ summary: 'Авторизация' })
	@ApiOkResponse({ type: UserApiResponse })
	@UseGuards(AuthenticationGuard)
	@Get('/log-in')
	async logIn(@Req() req: { user: UserFromRequest }): Promise<UserEntity> {
		return this.authenticationService.logIn(req.user);
	}
}
