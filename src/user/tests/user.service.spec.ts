import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { UserService } from '../services/user.service';
import { UserRepository } from '../repositories/user.repository';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { ChangeUserPasswordDto } from '../dtos/change-user-password.dto';
import { GetUserPaginatedDto } from '../dtos/get-user-paginated.dto';
import { UserFromRequest } from '../../authentication/interfaces/user-from-request.interface';
import { UserEntity } from '../entities/user.entity';
import { PaginationResultDto } from '../../common/dtos/pagination-result.dto';
import { EntityNotFoundException } from '../../common/exceptions/entity-not-found.exception';
import { EntityExistsException } from '../../common/exceptions/entity-exists.exception';
import { ActionIsForbiddenForUserException } from '../exceptions/action-is-forbidden-for-user.exception';
import { PasswordIsSameException } from '../exceptions/password-is-same.exception';
import { WrongOldPasswordException } from '../exceptions/wrong-old-password.exception';

describe('UserService', () => {
	let service: UserService;
	let userRepository: jest.Mocked<UserRepository>;
	let cacheManager: jest.Mocked<any>;
	let bcryptSpy: jest.SpyInstance;

	const mockUser = {
		id: 1,
		email: 'user@test.com',
		password: '$2b$10$hashedpassword',
		firstName: 'John',
		lastName: 'Doe',
		active: true,
	} as UserEntity;

	const mockUserFromRequest: UserFromRequest = {
		id: 1,
		email: 'user@test.com',
		iat: 215324,
		exp: 54326,
	};

	beforeEach(async () => {
		const mockUserRepository = {
			save: jest.fn(),
			remove: jest.fn(),
			softRemove: jest.fn(),
			findAllPaginated: jest.fn(),
			findByIdsWithRelations: jest.fn(),
			findByEmailForAuth: jest.fn(),
		};

		const mockCacheManager = {
			stores: [{ store: new Map() }] as any,
			mdel: jest.fn(),
		};

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				UserService,
				{ provide: UserRepository, useValue: mockUserRepository },
				{ provide: CACHE_MANAGER, useValue: mockCacheManager },
			],
		}).compile();

		service = module.get<UserService>(UserService);
		userRepository = module.get(UserRepository);
		cacheManager = module.get(CACHE_MANAGER);
		bcryptSpy = jest
			.spyOn(require('bcrypt'), 'hash')
			.mockImplementation(async (password: string) => `${password}_hashed`);
	});

	afterEach(() => {
		jest.clearAllMocks();
		jest.restoreAllMocks();
	});

	describe('create', () => {
		it('should create user with trimmed/lowercased email and hashed password', async () => {
			const dto: CreateUserDto = {
				email: '  User@Test.com  ',
				firstName: 'John',
				lastName: 'Doe',
				password: 'password123',
			};
			userRepository.findByEmailForAuth.mockResolvedValue(null);
			userRepository.save.mockResolvedValue({ id: 1, ...dto } as UserEntity);
			userRepository.findByIdsWithRelations.mockResolvedValue([mockUser]);

			const result = await service.create(dto);

			expect(userRepository.findByEmailForAuth).toHaveBeenCalledWith('user@test.com');
			expect(bcryptSpy).toHaveBeenCalledWith('password123', 10);
			expect(userRepository.save).toHaveBeenCalledWith({
				email: 'user@test.com',
				firstName: 'John',
				lastName: 'Doe',
				password: 'password123_hashed',
			});
			expect(result).toEqual(mockUser);
		});

		it('should throw EntityExistsException if email exists', async () => {
			const dto: CreateUserDto = {
				email: 'exists@test.com',
				firstName: 'Test',
				lastName: 'User',
				password: 'pass',
			};
			userRepository.findByEmailForAuth.mockResolvedValue(mockUser);

			await expect(service.create(dto)).rejects.toThrow(EntityExistsException);
			expect(userRepository.save).not.toHaveBeenCalled();
		});
	});

	describe('update', () => {
		it('should update user and invalidate cache', async () => {
			const dto: UpdateUserDto = { id: 1, firstName: 'Updated' };
			userRepository.findByIdsWithRelations.mockResolvedValue([mockUser]);
			userRepository.save.mockResolvedValue({ ...mockUser, firstName: 'Updated' } as UserEntity);
			userRepository.findByIdsWithRelations.mockResolvedValue([
				{ ...mockUser, firstName: 'Updated' },
			] as UserEntity[]);

			const result = await service.update(dto, mockUserFromRequest);

			expect(result.firstName).toBe('Updated');
			expect(cacheManager.mdel).toHaveBeenCalled();
		});

		it('should throw ActionIsForbiddenForUserException for wrong user', async () => {
			const dto: UpdateUserDto = { id: 2 };
			userRepository.findByIdsWithRelations.mockResolvedValue([
				{ ...mockUser, id: 2 },
			] as UserEntity[]);

			await expect(service.update(dto, mockUserFromRequest)).rejects.toThrow(
				ActionIsForbiddenForUserException,
			);
		});
	});

	describe('getAllPaginated', () => {
		it('should return paginated users', async () => {
			userRepository.findAllPaginated.mockResolvedValue([[mockUser], 1]);

			const dto: GetUserPaginatedDto = { skip: 0, limit: 10 };
			const result = await service.getAllPaginated(dto);

			expect(result.items).toContain(mockUser);
			expect(result.paginationInfo.totalItems).toBe(1);
		});
	});

	describe('getById', () => {
		it('should return user with relations', async () => {
			userRepository.findByIdsWithRelations.mockResolvedValue([mockUser]);

			const result = await service.getById(1, { articles: true });

			expect(result).toEqual(mockUser);
		});

		it('should throw EntityNotFoundException if not found', async () => {
			userRepository.findByIdsWithRelations.mockResolvedValue([]);

			await expect(service.getById(999)).rejects.toThrow(EntityNotFoundException);
		});
	});

	describe('getByIds', () => {
		it('should return empty array for empty ids', async () => {
			const result = await service.getByIds([]);

			expect(result).toEqual([]);
		});
	});

	describe('changeUserPassword', () => {
		it('should change password successfully', async () => {
			const dto: ChangeUserPasswordDto = {
				id: 1,
				oldPassword: 'oldpass123',
				password: 'newpass123',
			};
			userRepository.findByIdsWithRelations.mockResolvedValue([mockUser]);
			userRepository.findByEmailForAuth.mockResolvedValue(mockUser);
			jest.spyOn(require('bcrypt'), 'compare').mockResolvedValueOnce(true);
			userRepository.save.mockResolvedValue({
				...mockUser,
				password: 'newpass_hashed',
			} as UserEntity);

			await service.changeUserPassword(dto, mockUserFromRequest);

			expect(bcryptSpy).toHaveBeenCalledWith('newpass123', 10);
		});

		it('should throw PasswordIsSameException if passwords equal', async () => {
			const dto: ChangeUserPasswordDto = {
				id: 1,
				oldPassword: 'oldpass',
				password: 'oldpass',
			};

			await expect(service.changeUserPassword(dto, mockUserFromRequest)).rejects.toThrow(
				PasswordIsSameException,
			);
		});
	});

	describe('getByEmailForAuth', () => {
		it('should return user for auth', async () => {
			userRepository.findByEmailForAuth.mockResolvedValue(mockUser);

			const result = await service.getByEmailForAuth('user@test.com');

			expect(result).toEqual(mockUser);
		});

		it('should throw EntityNotFoundException if email not found', async () => {
			userRepository.findByEmailForAuth.mockResolvedValue(null);

			await expect(service.getByEmailForAuth('unknown@test.com')).rejects.toThrow(
				EntityNotFoundException,
			);
		});
	});

	describe('delete', () => {
		it('should delete user and invalidate all cache', async () => {
			userRepository.findByIdsWithRelations.mockResolvedValue([mockUser]);

			await service.delete(1, mockUserFromRequest);

			expect(userRepository.remove).toHaveBeenCalledWith(mockUser);
			expect(cacheManager.mdel).toHaveBeenCalled();
		});
	});

	describe('softDelete', () => {
		it('should soft delete user with relations', async () => {
			userRepository.findByIdsWithRelations.mockResolvedValue([mockUser]);

			await service.softDelete(1, mockUserFromRequest);

			expect(userRepository.findByIdsWithRelations).toHaveBeenCalledWith([1], { articles: true });
			expect(userRepository.softRemove).toHaveBeenCalledWith(mockUser);
		});
	});

	describe('private methods', () => {
		describe('checkIfUserAllowToAction', () => {
			it.each([
				{
					userId: 1,
					reqId: 1,
					userEmail: 'user@test.com',
					reqEmail: 'user@test.com',
					shouldPass: true,
				},
				{
					userId: 2,
					reqId: 1,
					userEmail: 'user@test.com',
					reqEmail: 'user@test.com',
					shouldPass: false,
				},
				{
					userId: 1,
					reqId: 1,
					userEmail: 'other@test.com',
					reqEmail: 'user@test.com',
					shouldPass: false,
				},
			])('should $shouldPass when userId=$userId reqId=$reqId', ({ shouldPass, ...params }) => {
				const user = { id: params.userId, email: params.userEmail } as UserEntity;
				const requestingUser = { id: params.reqId, email: params.reqEmail } as UserFromRequest;
				const serviceWithAccess = service as any;
				if (shouldPass) {
					expect(() =>
						serviceWithAccess.checkIfUserAllowToAction(user, requestingUser),
					).not.toThrow();
				} else {
					expect(() => serviceWithAccess.checkIfUserAllowToAction(user, requestingUser)).toThrow(
						ActionIsForbiddenForUserException,
					);
				}
			});
		});
	});

	describe('cache invalidation', () => {
		it('deleteInvalidCache should work with authorOnly=true', async () => {
			const serviceWithAccess = service as any;
			cacheManager.stores[0].store.set('articles:author:abc123', 'data');
			cacheManager.stores[0].store.set('articles:def456', 'data');

			await serviceWithAccess.deleteInvalidCache(true);

			expect(cacheManager.mdel).toHaveBeenCalledWith(
				expect.arrayContaining(['articles:author:abc123']),
			);
			expect(cacheManager.mdel).not.toHaveBeenCalledWith(['articles:def456']);
		});
	});
});
