import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationController } from '../controllers/authentication.controller';
import { AuthenticationService } from '../services/authentication.service';
import { CreateUserDto } from '../../user/dtos/create-user.dto';
import { SignInDto } from '../dtos/sign-in.dto';
import { UserFromRequest } from '../interfaces/user-from-request.interface';
import { UserEntity } from '../../user/entities/user.entity';
import { TokenApiResponse } from '../api-responses/token.api-response';
import { AuthenticationGuard } from '../guards/authentication.guard';

describe('AuthenticationController', () => {
	let controller: AuthenticationController;
	let authenticationService: jest.Mocked<AuthenticationService>;

	const mockUser: UserEntity = {
		id: 1,
		email: 'user@test.com',
		firstName: 'John',
		lastName: 'Doe',
	} as UserEntity;

	const mockTokenResponse: TokenApiResponse = {
		token: 'jwt.token.here',
	};

	const mockUserFromRequest: UserFromRequest = {
		id: 1,
		email: 'user@test.com',
		iat: 123456,
		exp: 1234567890,
	};

	beforeEach(async () => {
		const mockAuthenticationService = {
			registration: jest.fn(),
			signIn: jest.fn(),
			logIn: jest.fn(),
		};

		const module: TestingModule = await Test.createTestingModule({
			controllers: [AuthenticationController],
			providers: [
				{
					provide: AuthenticationService,
					useValue: mockAuthenticationService,
				},
			],
		})
			.overrideGuard(AuthenticationGuard)
			.useValue({ canActivate: jest.fn().mockReturnValue(true) })
			.compile();

		controller = module.get<AuthenticationController>(AuthenticationController);
		authenticationService = module.get(AuthenticationService);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('registration', () => {
		it('should call service.registration with CreateUserDto', async () => {
			const dto: CreateUserDto = {
				email: 'newuser@test.com',
				firstName: 'New',
				lastName: 'User',
				password: 'securepassword123',
			};
			authenticationService.registration.mockResolvedValue(mockUser);
			const result = await controller.registration(dto);
			expect(authenticationService.registration).toHaveBeenCalledWith(dto);
			expect(authenticationService.registration).toHaveBeenCalledTimes(1);
			expect(result).toEqual(mockUser);
		});

		it('should pass exact DTO object to service', async () => {
			const dto: CreateUserDto = {
				email: 'test@test.com',
				firstName: 'Test',
				lastName: 'User',
				password: 'password123',
			};
			authenticationService.registration.mockResolvedValue(mockUser);

			await controller.registration(dto);

			expect(authenticationService.registration).toHaveBeenCalledWith(
				expect.objectContaining({
					email: 'test@test.com',
					firstName: 'Test',
				}),
			);
		});
	});

	describe('signIn', () => {
		it('should call service.signIn with SignInDto', async () => {
			const dto: SignInDto = {
				email: 'user@test.com',
				password: 'password123',
			};
			authenticationService.signIn.mockResolvedValue(mockTokenResponse);
			const result = await controller.signIn(dto);
			expect(authenticationService.signIn).toHaveBeenCalledWith(dto);
			expect(result).toEqual(mockTokenResponse);
			expect(result.token).toBe('jwt.token.here');
		});
	});

	describe('logIn', () => {
		it('should call service.logIn with req.user from AuthenticationGuard', async () => {
			const req = { user: mockUserFromRequest };
			authenticationService.logIn.mockResolvedValue(mockUser);
			const result = await controller.logIn(req);
			expect(authenticationService.logIn).toHaveBeenCalledWith(mockUserFromRequest);
			expect(result).toEqual(mockUser);
		});

		it('should extract user from req.user correctly', async () => {
			const req = { user: { id: 999, email: 'other@test.com' } as UserFromRequest };
			const mockOtherUser = { id: 999, email: 'other@test.com' } as UserEntity;
			authenticationService.logIn.mockResolvedValue(mockOtherUser);

			await controller.logIn(req);

			expect(authenticationService.logIn).toHaveBeenCalledWith({
				id: 999,
				email: 'other@test.com',
			});
		});
	});

	describe('Guard handling', () => {
		it('should work with mocked AuthenticationGuard', async () => {
			const req = { user: mockUserFromRequest };
			authenticationService.logIn.mockResolvedValue(mockUser);

			const result = await controller.logIn(req);

			expect(result).toEqual(mockUser);
		});
	});

	describe('DTO contracts', () => {
		it('registration DTO should have all required fields', async () => {
			const dto: CreateUserDto = {
				email: 'user@test.com',
				firstName: 'John',
				lastName: 'Doe',
				password: 'password123',
			};
			authenticationService.registration.mockResolvedValue(mockUser);

			await controller.registration(dto);

			expect(authenticationService.registration).toHaveBeenCalledWith(expect.objectContaining(dto));
		});

		it('signIn DTO should have email and password', async () => {
			const dto: SignInDto = {
				email: 'user@test.com',
				password: 'password123',
			};
			authenticationService.signIn.mockResolvedValue(mockTokenResponse);

			await controller.signIn(dto);

			expect(authenticationService.signIn).toHaveBeenCalledWith(
				expect.objectContaining({
					email: 'user@test.com',
					password: 'password123',
				}),
			);
		});
	});
});
