import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationService } from '../services/authentication.service';
import { UserService } from '../../user/services/user.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../../user/dtos/create-user.dto';
import { SignInDto } from '../dtos/sign-in.dto';
import { UserFromRequest } from '../interfaces/user-from-request.interface';
import { UserEntity } from '../../user/entities/user.entity';
import { TokenApiResponse } from '../api-responses/token.api-response';
import { UserIsNotActiveException } from '../exceptions/user-is-not-active.exception';
import { WrongPasswordOrEmailException } from '../exceptions/wrong-password-or-email.exception';

describe('AuthenticationService', () => {
	let service: AuthenticationService;
	let userService: jest.Mocked<UserService>;
	let jwtService: jest.Mocked<JwtService>;
	let bcryptCompareSpy: jest.SpyInstance;

	const mockUser: UserEntity = {
		id: 1,
		email: 'user@test.com',
		password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
		firstName: 'John',
		lastName: 'Doe',
		active: true,
	} as UserEntity;

	const mockUserInactive = { ...mockUser, active: false, email: 'inactive@test.com' } as UserEntity;
	const mockUserWrongEmail = { ...mockUser, email: 'wrong@test.com' } as UserEntity;

	const mockUserFromRequest: UserFromRequest = {
		id: 1,
		email: 'user@test.com',
		iat: 1640995200,
		exp: 1641081600,
	};

	const mockToken: TokenApiResponse = {
		token:
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
	};

	beforeEach(async () => {
		const mockUserService = {
			create: jest.fn(),
			getByEmailForAuth: jest.fn(),
			getById: jest.fn(),
		};

		const mockJwtService = {
			sign: jest.fn(),
		};

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				AuthenticationService,
				{ provide: UserService, useValue: mockUserService },
				{ provide: JwtService, useValue: mockJwtService },
			],
		}).compile();

		service = module.get<AuthenticationService>(AuthenticationService);
		userService = module.get(UserService);
		jwtService = module.get(JwtService);
		bcryptCompareSpy = jest
			.spyOn(require('bcrypt'), 'compare')
			.mockImplementation(
				async (plain: string, hash: string): Promise<boolean> =>
					plain === 'password123' && hash === mockUser.password,
			);
	});

	afterEach(() => {
		jest.clearAllMocks();
		jest.restoreAllMocks();
	});

	describe('registration', () => {
		it('should delegate to userService.create without modification', async () => {
			const dto: CreateUserDto = {
				email: 'newuser@test.com',
				firstName: 'New',
				lastName: 'User',
				password: 'password123',
			};
			userService.create.mockResolvedValue(mockUser);

			const result = await service.registration(dto);

			expect(userService.create).toHaveBeenCalledWith(dto);
			expect(userService.create).toHaveBeenCalledTimes(1);
			expect(result).toEqual(mockUser);
		});
	});

	describe('signIn', () => {
		it('should sign in successfully with valid credentials', async () => {
			const dto: SignInDto = { email: '  user@test.com ', password: 'password123' };
			userService.getByEmailForAuth.mockResolvedValue(mockUser);
			jwtService.sign.mockReturnValue(mockToken.token);

			const result = await service.signIn(dto);

			expect(userService.getByEmailForAuth).toHaveBeenCalledWith('user@test.com');
			expect(bcryptCompareSpy).toHaveBeenCalledWith('password123', mockUser.password);
			expect(jwtService.sign).toHaveBeenCalledWith({ email: 'user@test.com', id: 1 });
			expect(result).toEqual(mockToken);
		});

		it('should trim and lowercase email before lookup', async () => {
			const dto: SignInDto = { email: ' User@Test.com ', password: 'password123' };
			userService.getByEmailForAuth.mockResolvedValue(mockUser);
			jwtService.sign.mockReturnValue(mockToken.token);

			await service.signIn(dto);

			expect(userService.getByEmailForAuth).toHaveBeenCalledWith('user@test.com');
		});

		it('should throw UserIsNotActiveException when user inactive', async () => {
			const dto: SignInDto = { email: 'user@test.com', password: 'pass' };
			userService.getByEmailForAuth.mockResolvedValue(mockUserInactive);

			await expect(service.signIn(dto)).rejects.toThrow(UserIsNotActiveException);
			expect(bcryptCompareSpy).not.toHaveBeenCalled();
		});

		it('should throw WrongPasswordOrEmailException when password wrong', async () => {
			const dto: SignInDto = { email: 'user@test.com', password: 'wrongpass' };
			userService.getByEmailForAuth.mockResolvedValue(mockUser);
			bcryptCompareSpy.mockResolvedValueOnce(false);

			await expect(service.signIn(dto)).rejects.toThrow(WrongPasswordOrEmailException);
			expect(bcryptCompareSpy).toHaveBeenCalledWith('wrongpass', mockUser.password);
		});
	});

	describe('logIn', () => {
		it('should return user for valid JWT payload', async () => {
			userService.getById.mockResolvedValue(mockUser);

			const result = await service.logIn(mockUserFromRequest);

			expect(userService.getById).toHaveBeenCalledWith(1);
			expect(result).toEqual(mockUser);
		});

		it('should throw UserIsNotActiveException when user inactive', async () => {
			userService.getById.mockResolvedValue(mockUserInactive);

			await expect(service.logIn(mockUserFromRequest)).rejects.toThrow(UserIsNotActiveException);
		});

		it('should throw WrongPasswordOrEmailException when email mismatch', async () => {
			userService.getById.mockResolvedValue(mockUserWrongEmail);

			await expect(service.logIn(mockUserFromRequest)).rejects.toThrow(
				WrongPasswordOrEmailException,
			);
		});
	});

	describe('private checkAccess', () => {
		it.each([
			{ active: true, emailMatch: true, shouldPass: true },
			{ active: false, emailMatch: true, shouldPass: false },
			{ active: true, emailMatch: false, shouldPass: false },
		])(
			'should $shouldPass access check for active=$active emailMatch=$emailMatch',
			({ active, emailMatch, shouldPass }) => {
				const serviceWithAccess = service as any;
				const testUser = {
					...mockUser,
					active,
					email: emailMatch ? 'user@test.com' : 'wrong@test.com',
				} as UserEntity;

				if (shouldPass) {
					expect(() => serviceWithAccess.checkAccess(testUser, 'user@test.com')).not.toThrow();
				} else {
					expect(() => serviceWithAccess.checkAccess(testUser, 'user@test.com')).toThrow();
				}
			},
		);
	});

	describe('private verifyPassword', () => {
		it('should pass verification for correct password', async () => {
			const serviceWithAccess = service as any;
			await expect(
				serviceWithAccess.verifyPassword('password123', mockUser.password),
			).resolves.not.toThrow();
			expect(bcryptCompareSpy).toHaveBeenCalledWith('password123', mockUser.password);
		});

		it('should throw for wrong password', async () => {
			const serviceWithAccess = service as any;
			bcryptCompareSpy.mockResolvedValueOnce(false);
			await expect(
				serviceWithAccess.verifyPassword('wrongpass', mockUser.password),
			).rejects.toThrow(WrongPasswordOrEmailException);
		});
	});
});
