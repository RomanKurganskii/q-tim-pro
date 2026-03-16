import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { CommonRepository } from '../../common/repositories/common.repository';
import { ArticleEntity } from '../entities/article.entity';
import { GetArticlePaginatedDto } from '../dtos/get-article-paginated.dto';

export class ArticleRepository extends CommonRepository<ArticleEntity> {
	constructor(
		@InjectRepository(ArticleEntity)
		repo: Repository<ArticleEntity>,
	) {
		super(repo, 'article');
	}

	async findAllPaginated(dto: GetArticlePaginatedDto): Promise<[ArticleEntity[], number]> {
		const query = this.repo.createQueryBuilder(this.alias);

		if (dto?.active || dto?.active === false) {
			query.andWhere(`${this.alias}.active = :active`, {
				active: dto.active,
			});
		}

		if (dto?.title) {
			query.andWhere(`${this.alias}.title ILIKE :title`, {
				title: `%${dto.title}%`,
			});
		}

		if (dto?.authorId) {
			query.andWhere(`${this.alias}.authorId = :authorId`, {
				authorId: dto.authorId,
			});
		}

		if (dto?.startPublicDate || dto?.endPublicDate) {
			query.andWhere(
				new Brackets((qb) => {
					if (dto?.startPublicDate) {
						qb.where(`${this.alias}.publicDate >= :start`, {
							start: dto.startPublicDate,
						});
					}
					if (dto?.endPublicDate) {
						qb.andWhere(`${this.alias}.publicDate <= :end`, {
							end: dto.endPublicDate,
						});
					}
				}),
			);
		}

		this.addRelations(query, { author: !!dto.author });

		return query
			.orderBy(`${this.alias}.id`, 'ASC')
			.skip(dto.skip * dto.limit)
			.take(dto.limit)
			.getManyAndCount();
	}

	async findIfExistTitle(title: string): Promise<string | undefined> {
		return this.repo
			.createQueryBuilder(this.alias)
			.where(`LOWER(TRIM(${this.alias}.title)) = :title`, { title })
			.select(`${this.alias}.title`, 'title')
			.getRawOne();
	}

	async findAuthorIdEmailByArticleId(
		id: number,
	): Promise<{ authorId: number; authorEmail: string } | undefined> {
		return this.repo
			.createQueryBuilder(this.alias)
			.leftJoin(`${this.alias}.author`, 'author')
			.where(`${this.alias}.id = :id`, { id })
			.select(`author.id`, 'authorId')
			.addSelect('author.email', 'authorEmail')
			.getRawOne();
	}
}
