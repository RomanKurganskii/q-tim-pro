import { Injectable } from '@nestjs/common';
import { UserService } from '../../user/services/user.service';
import { JwtService } from '@nestjs/jwt';
import { SignInDto } from '../dtos/sign-in.dto';
import { removeExtraSpaces } from '../../utils/remove-extra-spaces';
import { UserIsNotActiveException } from '../exceptions/user-is-not-active.exception';
import * as bcrypt from 'bcrypt';
import { WrongPasswordOrEmailException } from '../exceptions/wrong-password-or-email.exception';
import { UserFromRequest } from '../interfaces/user-from-request.interface';
import { UserEntity } from '../../user/entities/user.entity';
import { TokenApiResponse } from '../api-responses/token.api-response';
import { CreateUserDto } from '../../user/dtos/create-user.dto';

@Injectable()
export class AuthenticationService {
	constructor(
		private readonly userService: UserService,
		private readonly jwtService: JwtService,
	) {}

	async registration(dto: CreateUserDto): Promise<UserEntity> {
		//Можно будет добавить отправку подтверждения по почте
		return this.userService.create(dto);
	}

	/**
	 * Получение токена по паролю и почте
	 * @param dto - данные для входа
	 * @returns Объект с токеном
	 * @throws EntityNotFoundException если пользователь не найден
	 * @throws UserIsNotActiveException если пользователь не активен
	 * @throws WrongPasswordOrEmailException если пароль или почта указана неверно
	 */
	async signIn(dto: SignInDto): Promise<TokenApiResponse> {
		dto.email = removeExtraSpaces(dto.email, 'LOWER');
		const user = await this.userService.getByEmailForAuth(dto.email);
		this.checkAccess(user, dto.email);
		await this.verifyPassword(dto.password, user.password);
		return { token: this.jwtService.sign({ email: user.email, id: user.id }) };
	}

	/**
	 * Получение пользователя по токену
	 * @param userDto - информация о текущем пользователе из JWT
	 * @returns Пользователя
	 * @throws EntityNotFoundException если пользователь не найден
	 * @throws UserIsNotActiveException если пользователь не активен
	 * @throws WrongPasswordOrEmailException если почта пользователя несовпдает с той, которая находится в JWT
	 */
	async logIn(userDto: UserFromRequest): Promise<UserEntity> {
		const user = await this.userService.getById(userDto.id);
		this.checkAccess(user, userDto.email);
		return user;
	}

	/**
	 * Проверка доступа пользователя
	 * @param user - Объект пользователя
	 * @param email - email пользователя, которая указана в JWT
	 * @throws UserIsNotActiveException если пользователь не активен
	 * @throws WrongPasswordOrEmailException если почта пользователя несовпдает с той, которая находится в JWT
	 */
	private checkAccess(user: UserEntity, email: string): void {
		if (!user.active) {
			throw new UserIsNotActiveException();
		}
		if (user.email !== email) {
			throw new WrongPasswordOrEmailException();
		}
	}

	/**
	 * Проверка пароля пользователя
	 * @param userPassword - Пароль пользователя из БД
	 * @param dtoPassword - пароль пользователя, который указали
	 * @throws WrongPasswordOrEmailException если пароль указан неверно
	 */
	private async verifyPassword(dtoPassword: string, userPassword: string): Promise<void> {
		if (!(await bcrypt.compare(dtoPassword, userPassword))) {
			throw new WrongPasswordOrEmailException();
		}
	}
}
