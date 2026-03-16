import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { CommonRepository } from '../../common/repositories/common.repository';
import { GetUserPaginatedDto } from '../dtos/get-user-paginated.dto';

export class UserRepository extends CommonRepository<UserEntity> {
	constructor(
		@InjectRepository(UserEntity)
		repo: Repository<UserEntity>,
	) {
		super(repo, 'user');
	}

	/**
	 * Находит статьи с пагинацией и фильтрацией с опциональными связями
	 * @param dto - параметры пагинации и фильтров (skip, limit, active, articles)
	 * @returns Результат пагинации с общим количеством
	 */
	async findAllPaginated(dto: GetUserPaginatedDto): Promise<[UserEntity[], number]> {
		const query = this.repo.createQueryBuilder(this.alias);

		if (dto?.active || dto?.active === false) {
			query.andWhere(`${this.alias}.active = :active`, {
				active: dto.active,
			});
		}

		this.addRelations(query, { articles: !!dto.articles });

		return query
			.orderBy(`${this.alias}.id`, 'ASC')
			.skip(dto.skip * dto.limit)
			.take(dto.limit)
			.getManyAndCount();
	}

	/**
	 * Находит урезанный объект пользователя для авторизации
	 * @param email - email пользователя
	 * @returns Урезанный объект пользователя, в котором есть id, active, password, email или ничего
	 */
	async findByEmailForAuth(email: string): Promise<UserEntity | null | undefined> {
		return this.repo
			.createQueryBuilder(this.alias)
			.where(`${this.alias}.email = :email`, { email })
			.select(`${this.alias}.password`, 'password')
			.addSelect(`${this.alias}.email`, 'email')
			.addSelect(`${this.alias}.id`, 'id')
			.addSelect(`${this.alias}.active`, 'active')
			.getRawOne();
	}
}
