import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../controllers/user.controller';
import { UserService } from '../services/user.service';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { ChangeUserPasswordDto } from '../dtos/change-user-password.dto';
import { GetUserPaginatedDto } from '../dtos/get-user-paginated.dto';
import { GetUsersDto } from '../dtos/get-users.dto';
import { IdDto } from '../../common/dtos/id-dto';
import { UserRelationsDto } from '../dtos/user-relations.dto';
import { UserFromRequest } from '../../authentication/interfaces/user-from-request.interface';
import { UserEntity } from '../entities/user.entity';
import { PaginationResultDto } from '../../common/dtos/pagination-result.dto';
import { AuthenticationGuard } from '../../authentication/guards/authentication.guard';

describe('UserController', () => {
	let controller: UserController;
	let userService: jest.Mocked<UserService>;

	const mockUser: UserEntity = {
		id: 1,
		email: 'user@test.com',
		firstName: 'John',
		lastName: 'Doe',
		active: true,
	} as UserEntity;

	const mockUserRequest: UserFromRequest = {
		id: 1,
		email: 'user@test.com',
	} as UserFromRequest;

	const mockPaginated: PaginationResultDto<UserEntity> = {
		items: [mockUser],
		paginationInfo: {
			totalItems: 1,
			totalPages: 1,
			page: 1,
			perPage: 1,
			hasNextPage: false,
			hasPreviousPage: false,
		},
	} as PaginationResultDto<UserEntity>;

	beforeEach(async () => {
		const mockUserService = {
			update: jest.fn(),
			changeUserPassword: jest.fn(),
			getAllPaginated: jest.fn(),
			getById: jest.fn(),
			getByIds: jest.fn(),
			delete: jest.fn(),
			softDelete: jest.fn(),
			getByEmailForAuth: jest.fn(),
		};

		const module: TestingModule = await Test.createTestingModule({
			controllers: [UserController],
			providers: [
				{
					provide: UserService,
					useValue: mockUserService,
				},
			],
		})
			.overrideGuard(AuthenticationGuard)
			.useValue({ canActivate: jest.fn(() => true) })
			.compile();

		controller = module.get<UserController>(UserController);
		userService = module.get(UserService);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('update', () => {
		it('should call service.update with DTO from @Body and user from @Req', async () => {
			const updateDto: UpdateUserDto = {
				id: 1,
				firstName: 'Updated John',
			};
			const req = { user: mockUserRequest };
			userService.update.mockResolvedValue(mockUser);

			const result = await controller.update(updateDto, req);

			expect(userService.update).toHaveBeenCalledWith(updateDto, mockUserRequest);
			expect(result).toEqual(mockUser);
		});
	});

	describe('change-password', () => {
		it('should call service.changeUserPassword with DTO and user from req', async () => {
			const passwordDto: ChangeUserPasswordDto = {
				id: 1,
				oldPassword: 'old123',
				password: 'new123',
			};
			const req = { user: mockUserRequest };
			userService.changeUserPassword.mockResolvedValue(undefined);

			await expect(controller.changeUserPassword(passwordDto, req)).resolves.not.toThrow();
			expect(userService.changeUserPassword).toHaveBeenCalledWith(passwordDto, mockUserRequest);
		});
	});

	describe('paginated', () => {
		it('should pass @Query parameters to service.getAllPaginated', async () => {
			const queryDto: GetUserPaginatedDto = {
				skip: 0,
				limit: 10,
				active: true,
			};
			userService.getAllPaginated.mockResolvedValue(mockPaginated);

			const result = await controller.getAllPaginated(queryDto);

			expect(userService.getAllPaginated).toHaveBeenCalledWith(queryDto);
			expect(result).toEqual(mockPaginated);
		});
	});

	describe(':id', () => {
		it('should extract id from @Param and pass relations from @Query', async () => {
			const params: IdDto = { id: 42 };
			const query: UserRelationsDto = { articles: true };
			userService.getById.mockResolvedValue(mockUser);

			const result = await controller.getById(params, query);

			expect(userService.getById).toHaveBeenCalledWith(42, { articles: true });
			expect(result).toEqual(mockUser);
		});

		it('should correctly destructure @Param { id }', async () => {
			const params: IdDto = { id: 100 };
			userService.getById.mockResolvedValue(mockUser);

			await controller.getById(params, {});

			expect(userService.getById).toHaveBeenCalledWith(100, {});
		});
	});

	describe('getByIds', () => {
		it('should pass ids and articles flag from @Query', async () => {
			const queryDto: GetUsersDto = {
				ids: [1, 2, 3],
				articles: true,
			};
			userService.getByIds.mockResolvedValue([mockUser]);

			const result = await controller.getByIds(queryDto);

			expect(userService.getByIds).toHaveBeenCalledWith([1, 2, 3], { articles: true });
			expect(result).toContain(mockUser);
		});
	});

	describe('delete soft', () => {
		it('should call service.softDelete with id and user from req', async () => {
			const params: IdDto = { id: 1 };
			const req = { user: mockUserRequest };
			userService.softDelete.mockResolvedValue(undefined);

			await controller.softDelete(params, req);

			expect(userService.softDelete).toHaveBeenCalledWith(1, mockUserRequest);
		});
	});

	describe('delete', () => {
		it('should call service.delete with id and user from req', async () => {
			const params: IdDto = { id: 1 };
			const req = { user: mockUserRequest };
			userService.delete.mockResolvedValue(undefined);

			await controller.delete(params, req);

			expect(userService.delete).toHaveBeenCalledWith(1, mockUserRequest);
		});
	});

	describe('AuthenticationGuard на уровне класса', () => {
		it('should work with entire controller via overrideGuard', async () => {
			const dto: UpdateUserDto = { id: 1 };
			const req = { user: mockUserRequest };
			userService.update.mockResolvedValue(mockUser);

			const result = await controller.update(dto, req);
			expect(result).toEqual(mockUser);
		});
	});

	describe('Проверка контрактов DTO', () => {
		it('update should pass complete DTO to service', async () => {
			const dto: UpdateUserDto = {
				id: 1,
				firstName: 'Test',
				lastName: 'User',
			};
			const req = { user: mockUserRequest };
			userService.update.mockResolvedValue(mockUser);

			await controller.update(dto, req);

			expect(userService.update).toHaveBeenCalledWith(
				expect.objectContaining({
					id: 1,
					firstName: 'Test',
					lastName: 'User',
				}),
				mockUserRequest,
			);
		});
	});
});
