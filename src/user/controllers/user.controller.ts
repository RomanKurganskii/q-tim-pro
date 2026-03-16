import { Body, Controller, Delete, Get, Param, Patch, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserService } from '../services/user.service';
import { ApiBodyOperation } from '../../common/swagger-decorators/api-body-operation.swagger-decorator';
import { UserApiResponse } from '../api-responses/user.api-reponse';
import { UserEntity } from '../entities/user.entity';
import { USER_ENTITY_NAME } from '../consts/user.const';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { PaginationResultApiResponse } from '../../common/api-responses/pagination-result.api-response';
import { PaginationResultDto } from '../../common/dtos/pagination-result.dto';
import { GetUserPaginatedDto } from '../dtos/get-user-paginated.dto';
import { UserRelationsDto } from '../dtos/user-relations.dto';
import { IdDto } from '../../common/dtos/id-dto';
import { GetUsersDto } from '../dtos/get-users.dto';
import { ChangeUserPasswordDto } from '../dtos/change-user-password.dto';
import { AuthenticationGuard } from '../../authentication/guards/authentication.guard';
import { UserFromRequest } from '../../authentication/interfaces/user-from-request.interface';

@ApiTags(`${USER_ENTITY_NAME} (user)`)
@ApiBearerAuth()
@UseGuards(AuthenticationGuard)
@Controller('user')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@ApiBodyOperation(
		'Обновление',
		UpdateUserDto,
		UserApiResponse,
		'Данные для обновления пользователя',
	)
	@Patch('/update')
	async update(
		@Body() dto: UpdateUserDto,
		@Req() req: { user: UserFromRequest },
	): Promise<UserEntity> {
		return this.userService.update(dto, req.user);
	}

	@ApiOperation({ summary: 'Изменение пароля' })
	@ApiBody({
		description: 'Данные для изменения пароля пользователя',
		type: ChangeUserPasswordDto,
		required: true,
	})
	@ApiOkResponse()
	@Patch('/change-password')
	async changeUserPassword(
		@Body() dto: ChangeUserPasswordDto,
		@Req() req: { user: UserFromRequest },
	): Promise<void> {
		await this.userService.changeUserPassword(dto, req.user);
	}

	@ApiOperation({ summary: 'Получение с пагинацией' })
	@ApiOkResponse({ type: PaginationResultApiResponse(UserApiResponse) })
	@Get('/paginated')
	async getAllPaginated(
		@Query() dto: GetUserPaginatedDto,
	): Promise<PaginationResultDto<UserEntity>> {
		return this.userService.getAllPaginated(dto);
	}

	@ApiOperation({ summary: 'Получение по id' })
	@ApiOkResponse({ type: UserApiResponse })
	@Get(':id')
	async getById(@Param() { id }: IdDto, @Query() dto: UserRelationsDto): Promise<UserEntity> {
		return this.userService.getById(id, dto);
	}

	@ApiOperation({ summary: 'Получение по массиву id' })
	@ApiOkResponse({ type: UserApiResponse, isArray: true })
	@Get()
	async getByIds(@Query() dto: GetUsersDto): Promise<UserEntity[]> {
		return this.userService.getByIds(dto.ids, { articles: dto.articles });
	}

	@ApiOperation({ summary: 'Мягкое удаление' })
	@ApiOkResponse()
	@Delete(':id/soft')
	async softDelete(@Param() { id }: IdDto, @Req() req: { user: UserFromRequest }): Promise<void> {
		await this.userService.softDelete(id, req.user);
	}

	@ApiOperation({ summary: 'Удаление' })
	@ApiOkResponse()
	@Delete(':id')
	async delete(@Param() { id }: IdDto, @Req() req: { user: UserFromRequest }): Promise<void> {
		await this.userService.delete(id, req.user);
	}
}
