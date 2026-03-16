import { Inject, Injectable } from '@nestjs/common';
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
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import * as crypto from 'crypto';
import { REDIS_TTL } from '../../common/consts/glolbal.const';

@Injectable()
export class ArticleService {
	constructor(
		private readonly articleRepository: ArticleRepository,
		private readonly userService: UserService,
		@Inject(CACHE_MANAGER)
		private readonly cacheManager: Cache,
	) {}

	/**
	 * Создает новую статью
	 * @param dto - данные статьи для создания
	 * @param userDto - информация о текущем пользователе из JWT
	 * @returns Созданная статья с заполненными связями
	 * @throws EntityExistsException если title уже существует
	 * @throws ActionIsForbiddenForUserException если пользователь не автор
	 */
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
		await this.deleteInvalidCache();
		return this.getById(article.id);
	}

	/**
	 * Обновляет указанную статью
	 * @param dto - данные для обновления статьи
	 * @param userDto - информация о текущем пользователе из JWT
	 * @returns Обновленная статья
	 * @throws EntityExistsException если title уже существует
	 * @throws EntityNotFoundException если статья не найдена
	 * @throws ActionIsForbiddenForUserException если пользователь не автор
	 */
	async update(dto: UpdateArticleDto, userDto: UserFromRequest): Promise<ArticleEntity> {
		await this.checkIsUserAuthorByArticleId(dto.id, userDto);
		const article = await this.getById(dto.id);
		if (dto.title) {
			dto.title = removeExtraSpaces(dto.title, null);
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
		await this.deleteInvalidCache();
		return this.getById(article.id);
	}

	/**
	 * Удаляет указанную статью
	 * @param id - id статьи
	 * @param userDto - информация о текущем пользователе из JWT
	 * @throws EntityNotFoundException если статья не найдена
	 * @throws ActionIsForbiddenForUserException если пользователь не автор
	 */
	async delete(id: number, userDto: UserFromRequest): Promise<void> {
		await this.checkIsUserAuthorByArticleId(id, userDto);
		const article = await this.getById(id);
		await this.deleteInvalidCache();
		await this.articleRepository.remove(article);
	}

	/**
	 * Мягкое удаление указанной статьи
	 * @param id - id статьи
	 * @param userDto - информация о текущем пользователе из JWT
	 * @throws EntityNotFoundException если статья не найдена
	 * @throws ActionIsForbiddenForUserException если пользователь не автор
	 */
	async softDelete(id: number, userDto: UserFromRequest): Promise<void> {
		await this.checkIsUserAuthorByArticleId(id, userDto);
		const article = await this.getById(id);
		await this.deleteInvalidCache();
		await this.articleRepository.softRemove(article);
	}

	/**
	 * Получает статьи с пагинацией и фильтрацией с опциональными связями
	 * @param dto - параметры пагинации и фильтров (skip, limit, authorId, active, title, startPublicDate, endPublicDate)
	 * @returns Массив статей и информация пагинации
	 */
	async getAllPaginated(dto: GetArticlePaginatedDto): Promise<PaginationResultDto<ArticleEntity>> {
		const cacheKey = this.getCacheKey(dto);
		const cachedResult = await this.cacheManager.get(cacheKey);
		if (cachedResult) {
			return cachedResult as PaginationResultDto<ArticleEntity>;
		}
		const [items, count] = await this.articleRepository.findAllPaginated(dto);
		const result = getPaginatedResult(items, count, dto.limit, dto.skip);
		await this.cacheManager.set(cacheKey, result, REDIS_TTL);
		return result;
	}

	/**
	 * Получает статьи по ID с опциональными связями
	 * @param ids - массив ID статей
	 * @param dto - какие связи включить (author)
	 * @returns Найденные статьи или пустой массив
	 * @throws EntityNotFoundException если ни одной статьи не найдено
	 */
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

	/**
	 * Получает статью по ID с опциональными связями
	 * @param id - id статьи
	 * @param dto - какие связи включить (author)
	 * @returns Найденную статью
	 * @throws EntityNotFoundException если статья не найдена
	 */
	async getById(id: number, dto?: ArticleRelationsDto): Promise<ArticleEntity> {
		const result = await this.getByIds([id], dto);
		if (!result?.length) {
			throw new EntityNotFoundException(ARTICLE_ENTITY_NAME, [['id', id]]);
		}
		return result[0];
	}

	/**
	 * Проверяет уникально названия статьи
	 * @param title - Название статьи
	 * @throws EntityExistsException если название не уникально
	 */
	private async checkIsTitleUnique(title: string): Promise<void> {
		const existingTitle = await this.articleRepository.findIfExistTitle(title.toLowerCase());
		if (existingTitle) {
			throw new EntityExistsException(ARTICLE_ENTITY_NAME, [['title', title]]);
		}
	}

	/**
	 * Проверяет являет ли автором указанной статьи пользователь, который запрашивает update/delete методы
	 * @param id - Id статьи
	 * @param requestingUser - информация о текущем пользователе из JWT
	 * @throws EntityNotFoundException если статья не найдена
	 * @throws ActionIsForbiddenForUserException если пользователь не является автором статьи
	 */
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

	/**
	 * Проверяет являет ли автором пользователь, который запрашивает create/update/delete методы
	 * @param authorId - id автора
	 * @param authorEmail - email автора
	 * @param requestingUser - информация о текущем пользователе из JWT
	 * @throws ActionIsForbiddenForUserException если пользователь не является автором статьи
	 */
	private checkIsUserAuthor(
		authorId: number,
		authorEmail: string,
		requestingUser: UserFromRequest,
	): void {
		if (authorId !== requestingUser.id || authorEmail !== requestingUser.email) {
			throw new ActionIsForbiddenForUserException();
		}
	}

	/**
	 * Создает хешированный ключ для Redis
	 * @param dto - параметры пагинации и фильтров (skip, limit, authorId, active, title, startPublicDate, endPublicDate)
	 * @returns Хешированный ключ для Redis
	 */
	private getCacheKey(dto: GetArticlePaginatedDto): string {
		const filterString = JSON.stringify(dto, Object.keys(dto).sort());
		const queryHash = crypto.createHash('md5').update(filterString).digest('hex').slice(0, 15);
		return `articles:${dto.author ? 'author:' : ''}${queryHash}`;
	}

	/**
	 * Удаляет невалидный кеш
	 */
	private async deleteInvalidCache(): Promise<void> {
		const keysToDelete: string[] = [];
		for (const storeObject of this.cacheManager.stores) {
			for (const item of storeObject.store as Map<string, any>) {
				keysToDelete.push(String(item[0]));
			}
		}
		await this.cacheManager.mdel(keysToDelete);
	}
}
