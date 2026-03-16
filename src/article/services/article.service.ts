import { Injectable } from '@nestjs/common';
import { ArticleRepository } from '../repositories/article.repository';
import { CreateArticleDto } from '../dtos/create-article.dto';
import { ArticleEntity } from '../entities/article.entity';
import { removeExtraSpaces } from '../../utils/remove-extra-spaces';
import { GetArticlePaginatedDto } from '../dtos/get-article-paginated.dto';
import { PaginationResultDto } from '../../common/dtos/pagination-result.dto';
import { getPaginatedResult } from '../../utils/get-paginated-result';
import { EntityNotFoundException } from '../../common/exceptions/entity-not-found.exception';
import { ARTICLE_ENTITY_NAME } from '../consts/article.const';
import { ArticleRelationsDto } from '../dtos/article-relations.dto';
import { UserFromRequest } from '../../authentication/interfaces/user-from-request.interface';
import { UpdateArticleDto } from '../dtos/update-article.dto';
import { EntityExistsException } from '../../common/exceptions/entity-exists.exception';
import { UserService } from '../../user/services/user.service';
import { ActionIsForbiddenForUserException } from '../../user/exceptions/action-is-forbidden-for-user.exception';

@Injectable()
export class ArticleService {
	constructor(
		private readonly articleRepository: ArticleRepository,
		private readonly userService: UserService,
	) {}

	async create(dto: CreateArticleDto, userDto: UserFromRequest): Promise<ArticleEntity> {
		dto.title = removeExtraSpaces(dto.title, null);
		await this.checkIsTitleUnique(dto.title);
		const author = await this.userService.getById(dto.authorId);
		this.checkIsUserAuthor(author.id, author.email, userDto);
		const article = await this.articleRepository.save({
			...dto,
			author,
			active: dto.active ?? undefined,
		});
		return this.getById(article.id);
	}

	async update(dto: UpdateArticleDto, userDto: UserFromRequest): Promise<ArticleEntity> {
		await this.checkIsUserAuthorByArticleId(dto.id, userDto);
		const article = await this.getById(dto.id);
		if (dto.title) {
			await this.checkIsTitleUnique(dto.title);
		}
		const active = dto.active ?? article.active;
		const publicDate =
			dto.publicArticle !== undefined
				? dto.publicArticle
					? new Date()
					: null
				: article.publicDate;
		await this.articleRepository.save({ ...article, ...dto, active, publicDate });
		return this.getById(article.id);
	}

	async delete(id: number, userDto: UserFromRequest): Promise<void> {
		await this.checkIsUserAuthorByArticleId(id, userDto);
		const article = await this.getById(id);
		await this.articleRepository.remove(article);
	}

	async softDelete(id: number, userDto: UserFromRequest): Promise<void> {
		await this.checkIsUserAuthorByArticleId(id, userDto);
		const article = await this.getById(id);
		await this.articleRepository.softRemove(article);
	}

	async getAllPaginated(dto: GetArticlePaginatedDto): Promise<PaginationResultDto<ArticleEntity>> {
		const [items, count] = await this.articleRepository.findAllPaginated(dto);
		return getPaginatedResult(items, count, dto.limit, dto.skip);
	}

	async getByIds(ids: number[], dto?: ArticleRelationsDto): Promise<ArticleEntity[]> {
		if (!ids?.length) {
			return [];
		}
		const result = await this.articleRepository.findByIdsWithRelations(ids, dto ? { ...dto } : dto);
		if (!result?.length) {
			throw new EntityNotFoundException(ARTICLE_ENTITY_NAME, [['id', ids]]);
		}
		return result;
	}

	async getById(id: number, dto?: ArticleRelationsDto): Promise<ArticleEntity> {
		const result = await this.getByIds([id], dto);
		if (!result?.length) {
			throw new EntityNotFoundException(ARTICLE_ENTITY_NAME, [['id', id]]);
		}
		return result[0];
	}

	private async checkIsTitleUnique(title: string): Promise<void> {
		const existingTitle = await this.articleRepository.findIfExistTitle(title.toLowerCase());
		if (existingTitle) {
			throw new EntityExistsException(ARTICLE_ENTITY_NAME, [['title', title]]);
		}
	}

	private async checkIsUserAuthorByArticleId(
		id: number,
		requestingUser: UserFromRequest,
	): Promise<void> {
		const author = await this.articleRepository.findAuthorIdEmailByArticleId(id);
		if (!author) {
			throw new EntityNotFoundException(ARTICLE_ENTITY_NAME, [['id', id]]);
		}
		this.checkIsUserAuthor(author.authorId, author.authorEmail, requestingUser);
	}

	private checkIsUserAuthor(
		authorId: number,
		authorEmail: string,
		requestingUser: UserFromRequest,
	): void {
		if (authorId !== requestingUser.id && authorEmail !== requestingUser.email) {
			throw new ActionIsForbiddenForUserException();
		}
	}
}
