import { Injectable } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UserEntity } from '../entities/user.entity';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { UserRelationsDto } from '../dtos/user-relations.dto';
import { EntityNotFoundException } from '../../common/exceptions/entity-not-found.exception';
import { USER_ENTITY_NAME } from '../consts/user.const';
import { getPaginatedResult } from '../../utils/get-paginated-result';
import { PaginationResultDto } from '../../common/dtos/pagination-result.dto';
import { GetUserPaginatedDto } from '../dtos/get-user-paginated.dto';
import { EntityExistsException } from '../../common/exceptions/entity-exists.exception';
import { removeExtraSpaces } from '../../utils/remove-extra-spaces';
import * as bcrypt from 'bcrypt';
import { ENV } from '../../common/consts/env';
import { ChangeUserPasswordDto } from '../dtos/change-user-password.dto';
import { PasswordIsSameException } from '../exceptions/password-is-same.exception';
import { WrongOldPasswordException } from '../exceptions/wrong-old-password.exception';
import { UserFromRequest } from '../../authentication/interfaces/user-from-request.interface';
import { ActionIsForbiddenForUserException } from '../exceptions/action-is-forbidden-for-user.exception';

@Injectable()
export class UserService {
	constructor(private readonly userRepository: UserRepository) {}

	/**
	 * Создает нового пользователя
	 * @param dto - данные для создания пользователя
	 * @returns Пользователя
	 * @throws EntityExistsException если email уже существует
	 */
	async create(dto: CreateUserDto): Promise<UserEntity> {
		dto.email = removeExtraSpaces(dto.email, 'LOWER');
		await this.checkIsEmailExists(dto.email);
		dto.password = await bcrypt.hash(dto.password, +(process.env[ENV.BCRYPT_SALT] ?? 10));
		const user = await this.userRepository.save(dto);
		return this.getById(user.id);
	}

	/**
	 * Обновляет указанного пользователя
	 * @param dto - данные для обновления пользователя
	 * @param userDto - информация о текущем пользователе из JWT
	 * @returns Обновленного пользователя
	 * @throws EntityNotFoundException если пользователь не найден
	 * @throws ActionIsForbiddenForUserException если id или email пользователя не совпадает с данными из JWT
	 */
	async update(dto: UpdateUserDto, userDto: UserFromRequest): Promise<UserEntity> {
		const user = await this.getById(dto.id);
		this.checkIfUserAllowToAction(user, userDto);
		await this.userRepository.save({ ...user, ...dto });
		return this.getById(user.id);
	}

	/**
	 * Удаление указанного пользователя
	 * @param id - id пользователя
	 * @param userDto - информация о текущем пользователе из JWT
	 * @throws EntityNotFoundException если пользователь не найден
	 * @throws ActionIsForbiddenForUserException если id или email пользователя не совпадает с данными из JWT
	 */
	async delete(id: number, userDto: UserFromRequest): Promise<void> {
		const user = await this.getById(id);
		this.checkIfUserAllowToAction(user, userDto);
		await this.userRepository.remove(user);
	}

	/**
	 * "Мягкое" удаление указанного пользователя
	 * @param id - id пользователя
	 * @param userDto - информация о текущем пользователе из JWT
	 * @throws EntityNotFoundException если пользователь не найден
	 * @throws ActionIsForbiddenForUserException если id или email пользователя не совпадает с данными из JWT
	 */
	async softDelete(id: number, userDto: UserFromRequest): Promise<void> {
		const user = await this.getById(id, { articles: true });
		this.checkIfUserAllowToAction(user, userDto);
		await this.userRepository.softRemove(user);
	}

	/**
	 * Находит статьи с пагинацией и фильтрацией с опциональными связями
	 * @param dto - параметры пагинации и фильтров (skip, limit, active, articles)
	 * @returns Массив пользователей и информация пагинации
	 */
	async getAllPaginated(dto: GetUserPaginatedDto): Promise<PaginationResultDto<UserEntity>> {
		const [items, count] = await this.userRepository.findAllPaginated(dto);
		return getPaginatedResult(items, count, dto.limit, dto.skip);
	}

	/**
	 * Получает пользователей по ID с опциональными связями
	 * @param ids - массив ID пользователей
	 * @param dto - какие связи включить (articles)
	 * @returns Найденные пользователи или пустой массив
	 * @throws EntityNotFoundException если ни одного пользователя не найдено
	 */
	async getByIds(ids: number[], dto?: UserRelationsDto): Promise<UserEntity[]> {
		if (!ids?.length) {
			return [];
		}
		const result = await this.userRepository.findByIdsWithRelations(ids, dto ? { ...dto } : dto);
		if (!result?.length) {
			throw new EntityNotFoundException(USER_ENTITY_NAME, [['id', ids]]);
		}
		return result;
	}

	/**
	 * Получает пользователя по ID с опциональными связями
	 * @param id - ID пользователей
	 * @param dto - какие связи включить (articles)
	 * @returns Найденный пользователь
	 * @throws EntityNotFoundException если пользователь не найден
	 */
	async getById(id: number, dto?: UserRelationsDto): Promise<UserEntity> {
		const result = await this.getByIds([id], dto);
		if (!result?.length) {
			throw new EntityNotFoundException(USER_ENTITY_NAME, [['id', id]]);
		}
		return result[0];
	}

	/**
	 * Смена пароля у пользователя
	 * @param dto - Данные для смены пароля
	 * @param userDto - информация о текущем пользователе из JWT
	 * @throws PasswordIsSameException если новый пароль такой же как старый
	 * @throws EntityNotFoundException если пользователь не найден
	 * @throws ActionIsForbiddenForUserException если id или email пользователя не совпадает с данными из JWT
	 * @throws WrongOldPasswordException если старый пароль указан неверно
	 */
	async changeUserPassword(dto: ChangeUserPasswordDto, userDto: UserFromRequest): Promise<void> {
		//Можно добавить отправку на почту/тг кода
		if (dto.password === dto.oldPassword) {
			throw new PasswordIsSameException();
		}
		const user = await this.getById(dto.id);
		this.checkIfUserAllowToAction(user, userDto);
		await this.checkPasswords(user.email, dto.oldPassword);
		await this.userRepository.save({
			...user,
			password: await bcrypt.hash(dto.password, +(process.env[ENV.BCRYPT_SALT] ?? 10)),
		});
	}
	/**
	 * Получает урезанный объект пользователя для авторизации
	 * @param email - email пользователя
	 * @returns Урезанный объект пользователя, в котором есть id, active, password, email
	 * @throws EntityNotFoundException если пользователь не найден
	 */
	async getByEmailForAuth(email: string): Promise<UserEntity> {
		const result = await this.userRepository.findByEmailForAuth(email);
		if (!result) {
			throw new EntityNotFoundException(USER_ENTITY_NAME, [['email', email]]);
		}
		return result;
	}

	/**
	 * Проверяет уникальность email
	 * @param email - email пользователя
	 * @throws EntityExistsException если пользователь с email найден
	 */
	private async checkIsEmailExists(email: string): Promise<void> {
		const isExists = await this.userRepository.findByEmailForAuth(email);
		if (isExists) {
			throw new EntityExistsException(USER_ENTITY_NAME, [['email', email]]);
		}
	}

	/**
	 * Проверяет указанный email и id в JWT и у пользователя
	 * @param targerUser - Пользователь, к которому обращаются с UPDATE/DELETE методы
	 * @param requestingUser - информация о текущем пользователе из JWT
	 * @throws ActionIsForbiddenForUserException если id или email не совпал
	 */
	private checkIfUserAllowToAction(targerUser: UserEntity, requestingUser: UserFromRequest): void {
		if (targerUser.id !== requestingUser.id || targerUser.email !== requestingUser.email) {
			throw new ActionIsForbiddenForUserException();
		}
	}

	/**
	 * Проверяет указанный старый пароль у пользователя
	 * @param email - email пользователя
	 * @param password - пароль пользователя
	 * @throws WrongOldPasswordException если старый пароль указан неверно
	 */
	private async checkPasswords(email: string, oldPassword: string): Promise<void> {
		const user = await this.getByEmailForAuth(email);
		if (!(await bcrypt.compare(oldPassword, user.password))) {
			throw new WrongOldPasswordException();
		}
	}
}
