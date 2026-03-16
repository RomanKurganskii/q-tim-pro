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

	async create(dto: CreateUserDto): Promise<UserEntity> {
		dto.email = removeExtraSpaces(dto.email, 'LOWER');
		await this.checkIsEmailExists(dto.email);
		dto.password = await bcrypt.hash(dto.password, +(process.env[ENV.BCRYPT_SALT] ?? 10));
		const user = await this.userRepository.save(dto);
		return this.getById(user.id);
	}

	async update(dto: UpdateUserDto, userDto: UserFromRequest): Promise<UserEntity> {
		const user = await this.getById(dto.id);
		this.checkIfUserAllowToAction(user, userDto);
		await this.userRepository.save({ ...user, ...dto });
		return this.getById(user.id);
	}

	async delete(id: number, userDto: UserFromRequest): Promise<void> {
		const user = await this.getById(id);
		this.checkIfUserAllowToAction(user, userDto);
		await this.userRepository.remove(user);
	}

	async softDelete(id: number, userDto: UserFromRequest): Promise<void> {
		const user = await this.getById(id);
		this.checkIfUserAllowToAction(user, userDto);
		await this.userRepository.softRemove(user);
	}

	async getAllPaginated(dto: GetUserPaginatedDto): Promise<PaginationResultDto<UserEntity>> {
		const [items, count] = await this.userRepository.findAllPaginated(dto);
		return getPaginatedResult(items, count, dto.limit, dto.skip);
	}

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

	async getById(id: number, dto?: UserRelationsDto): Promise<UserEntity> {
		const result = await this.getByIds([id], dto);
		if (!result?.length) {
			throw new EntityNotFoundException(USER_ENTITY_NAME, [['id', id]]);
		}
		return result[0];
	}

	async changeUserPassword(
		{ id, password, oldPassword }: ChangeUserPasswordDto,
		userDto: UserFromRequest,
	): Promise<void> {
		//Можно добавить отправку на почту/тг кода
		if (password === oldPassword) {
			throw new PasswordIsSameException();
		}
		const user = await this.getById(id);
		this.checkIfUserAllowToAction(user, userDto);
		await this.checkPasswords(user.email, oldPassword);
		await this.userRepository.save({
			...user,
			password: await bcrypt.hash(password, +(process.env[ENV.BCRYPT_SALT] ?? 10)),
		});
	}

	async getByEmailForAuth(email: string): Promise<UserEntity> {
		const result = await this.userRepository.findByEmailForAuth(email);
		if (!result) {
			throw new EntityNotFoundException(USER_ENTITY_NAME, [['email', email]]);
		}
		return result;
	}

	private async checkIsEmailExists(email: string): Promise<void> {
		const isExists = await this.userRepository.findByEmailForAuth(email);
		if (isExists) {
			throw new EntityExistsException(USER_ENTITY_NAME, [['email', email]]);
		}
	}

	private checkIfUserAllowToAction(targerUser: UserEntity, requestingUser: UserFromRequest): void {
		if (targerUser.id !== requestingUser.id && targerUser.email !== requestingUser.email) {
			throw new ActionIsForbiddenForUserException();
		}
	}

	private async checkPasswords(email: string, oldPassword: string): Promise<void> {
		const user = await this.getByEmailForAuth(email);
		if (!(await bcrypt.compare(oldPassword, user.password))) {
			throw new WrongOldPasswordException();
		}
	}
}
