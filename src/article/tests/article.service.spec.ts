import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ArticleService } from '../services/article.service';
import { ArticleRepository } from '../repositories/article.repository';
import { UserService } from '../../user/services/user.service';
import { CreateArticleDto } from '../dtos/create-article.dto';
import { UpdateArticleDto } from '../dtos/update-article.dto';
import { GetArticlePaginatedDto } from '../dtos/get-article-paginated.dto';
import { ArticleEntity } from '../entities/article.entity';
import { UserFromRequest } from '../../authentication/interfaces/user-from-request.interface';
import { EntityNotFoundException } from '../../common/exceptions/entity-not-found.exception';
import { EntityExistsException } from '../../common/exceptions/entity-exists.exception';
import { ActionIsForbiddenForUserException } from '../../user/exceptions/action-is-forbidden-for-user.exception';
import { REDIS_TTL } from '../../common/consts/glolbal.const';
import { UserEntity } from '../../user/entities/user.entity';
import { removeExtraSpaces } from '../../utils/remove-extra-spaces';

describe('ArticleService', () => {
	let service: ArticleService;
	let articleRepository: jest.Mocked<ArticleRepository>;
	let userService: jest.Mocked<UserService>;
	let cacheManager: jest.Mocked<any>;
	const mockAuthor = {
		id: 1,
		email: 'author@test.com',
		password: '123',
		createdAt: new Date(),
		updatedAt: new Date(),
		active: true,
	} as UserEntity;
	const wrongAuthor = {
		id: 55,
		email: 'author23@test.com',
		password: '123',
		createdAt: new Date(),
		updatedAt: new Date(),
		active: true,
	} as UserEntity;
	const mockArticle = {
		id: 1,
		title: 'Test Article',
		description: 'Content',
		author: mockAuthor,
		active: true,
		publicDate: null,
		createdAt: new Date(),
		updatedAt: new Date(),
	} as ArticleEntity;

	const mockUserDto: UserFromRequest = {
		id: 1,
		email: 'author@test.com',
		iat: 1235,
		exp: 124667,
	};

	beforeEach(async () => {
		const mockArticleRepository = {
			save: jest.fn(),
			findAllPaginated: jest.fn(),
			findByIdsWithRelations: jest.fn(),
			findIfExistTitle: jest.fn(),
			findAuthorIdEmailByArticleId: jest.fn(),
			remove: jest.fn(),
			softRemove: jest.fn(),
		};

		jest
			.spyOn(require('../../utils/remove-extra-spaces'), 'removeExtraSpaces')
			.mockReturnValue('New Article');

		const mockUserService = {
			getById: jest.fn(),
		};

		const mockCacheManager = {
			get: jest.fn(),
			set: jest.fn(),
			stores: [{ store: new Map() }] as any,
			mdel: jest.fn(),
		};

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ArticleService,
				{ provide: ArticleRepository, useValue: mockArticleRepository },
				{ provide: UserService, useValue: mockUserService },
				{ provide: CACHE_MANAGER, useValue: mockCacheManager },
			],
		}).compile();

		service = module.get<ArticleService>(ArticleService);
		articleRepository = module.get(ArticleRepository);
		userService = module.get(UserService);
		cacheManager = module.get(CACHE_MANAGER);

		jest.clearAllMocks();
	});

	describe('create', () => {
		it('should create article successfully', async () => {
			const dto: CreateArticleDto = {
				title: '  New Article  ',
				description: 'Content',
				authorId: 1,
				active: true,
			};

			userService.getById.mockResolvedValue(mockAuthor as any);
			articleRepository.save.mockResolvedValue(mockArticle);
			articleRepository.findByIdsWithRelations.mockResolvedValue([mockArticle]);

			const result = await service.create(dto, mockUserDto);

			expect(removeExtraSpaces).toHaveBeenCalledWith('  New Article  ', null);
			expect(userService.getById).toHaveBeenCalledWith(1);
			expect(articleRepository.save).toHaveBeenCalledWith({
				title: 'New Article',
				description: 'Content',
				authorId: 1,
				author: mockAuthor,
				active: true,
			});
			expect(result).toEqual(mockArticle);
		});

		it('should throw EntityExistsException if title exists', async () => {
			const dto: CreateArticleDto = { title: 'Existing', description: '', authorId: 1 };

			jest
				.spyOn(service as any, 'checkIsTitleUnique')
				.mockRejectedValue(new EntityExistsException('Article', [['title', 'Existing']]));

			await expect(service.create(dto, mockUserDto)).rejects.toThrow(EntityExistsException);
		});

		it('should throw ActionIsForbiddenForUserException if not author', async () => {
			const dto: CreateArticleDto = { title: 'Test', description: '', authorId: 2 };
			userService.getById.mockResolvedValue(wrongAuthor);

			await expect(service.create(dto, mockUserDto)).rejects.toThrow(
				ActionIsForbiddenForUserException,
			);
		});
	});

	describe('update', () => {
		it('should update article successfully', async () => {
			const dto: UpdateArticleDto = {
				id: 1,
				title: 'Updated Title',
				publicArticle: true,
			};

			jest.spyOn(service as any, 'checkIsUserAuthorByArticleId').mockResolvedValue(undefined);
			articleRepository.findByIdsWithRelations.mockResolvedValue([mockArticle]);
			jest.spyOn(service as any, 'checkIsTitleUnique').mockResolvedValue(undefined);
			articleRepository.save.mockResolvedValue({
				...mockArticle,
				title: 'Updated Title',
				publicDate: new Date(),
			} as ArticleEntity);
			articleRepository.findByIdsWithRelations.mockResolvedValue([
				{ ...mockArticle, title: 'Updated Title', publicDate: new Date() },
			] as ArticleEntity[]);

			const result = await service.update(dto, mockUserDto);
			expect(removeExtraSpaces).toHaveBeenCalledWith('Updated Title', null);
			expect(result.title).toBe('Updated Title');
			expect(result.publicDate).toEqual(expect.any(Date));
		});

		it('should keep existing publicDate if not changed', async () => {
			const dto: UpdateArticleDto = { id: 1, description: 'New content' };

			jest.spyOn(service as any, 'checkIsUserAuthorByArticleId').mockResolvedValue(undefined);
			articleRepository.findByIdsWithRelations.mockResolvedValue([mockArticle]);
			articleRepository.save.mockResolvedValue(mockArticle);
			articleRepository.findByIdsWithRelations.mockResolvedValue([mockArticle]);

			const result = await service.update(dto, mockUserDto);

			expect(result.publicDate).toEqual(mockArticle.publicDate);
		});
		it('should throw EntityNotFoundException if not author', async () => {
			const dto: UpdateArticleDto = { id: 1, description: 'New content' };
			userService.getById.mockResolvedValue(wrongAuthor);

			await expect(service.update(dto, mockUserDto)).rejects.toThrow(EntityNotFoundException);
		});
	});

	describe('delete', () => {
		it('should delete article successfully', async () => {
			jest.spyOn(service as any, 'checkIsUserAuthorByArticleId').mockResolvedValue(undefined);
			articleRepository.findByIdsWithRelations.mockResolvedValue([mockArticle]);

			await service.delete(1, mockUserDto);

			expect(articleRepository.remove).toHaveBeenCalledWith(mockArticle);
		});

		it('should throw if article not found', async () => {
			jest
				.spyOn(service as any, 'checkIsUserAuthorByArticleId')
				.mockRejectedValue(new EntityNotFoundException('Article', [['id', 1]]));

			await expect(service.delete(1, mockUserDto)).rejects.toThrow(EntityNotFoundException);
		});
	});

	describe('softDelete', () => {
		it('should soft delete article successfully', async () => {
			jest.spyOn(service as any, 'checkIsUserAuthorByArticleId').mockResolvedValue(undefined);
			articleRepository.findByIdsWithRelations.mockResolvedValue([mockArticle]);

			await service.softDelete(1, mockUserDto);

			expect(articleRepository.softRemove).toHaveBeenCalledWith(mockArticle);
		});
	});

	describe('getAllPaginated', () => {
		it('should return cached result if exists', async () => {
			const dto: GetArticlePaginatedDto = { skip: 0, limit: 10 };
			const cachedResult = { items: [], total: 0 };

			cacheManager.get.mockResolvedValue(cachedResult);

			const result = await service.getAllPaginated(dto);

			expect(cacheManager.get).toHaveBeenCalled();
			expect(result).toEqual(cachedResult);
			expect(articleRepository.findAllPaginated).not.toHaveBeenCalled();
		});

		it('should cache and return result if not cached', async () => {
			const dto: GetArticlePaginatedDto = { skip: 0, limit: 10 };
			const mockResult = [[mockArticle], 1];

			cacheManager.get.mockResolvedValue(null);
			articleRepository.findAllPaginated.mockResolvedValue(mockResult as any);

			const result = await service.getAllPaginated(dto);

			expect(cacheManager.set).toHaveBeenCalledWith(
				expect.stringContaining('articles:'),
				expect.any(Object),
				REDIS_TTL,
			);
			expect(result.items).toContain(mockArticle);
		});
	});

	describe('getById', () => {
		it('should return article by id', async () => {
			articleRepository.findByIdsWithRelations.mockResolvedValue([mockArticle]);

			const result = await service.getById(1);

			expect(result).toEqual(mockArticle);
		});

		it('should throw EntityNotFoundException if not found', async () => {
			articleRepository.findByIdsWithRelations.mockResolvedValue([]);

			await expect(service.getById(999)).rejects.toThrow(EntityNotFoundException);
		});
	});

	describe('getByIds', () => {
		it('should return empty array for empty ids', async () => {
			const result = await service.getByIds([]);

			expect(result).toEqual([]);
		});

		it('should return articles by multiple ids', async () => {
			const ids = [1, 2];
			articleRepository.findByIdsWithRelations.mockResolvedValue([mockArticle]);

			const result = await service.getByIds(ids);

			expect(result).toEqual([mockArticle]);
		});

		it('should should throw EntityNotFoundException if not found', async () => {
			const ids = [3, 4, 5];
			articleRepository.findByIdsWithRelations.mockResolvedValue([]);

			await expect(service.getByIds(ids)).rejects.toThrow(EntityNotFoundException);
		});
	});

	describe('private methods', () => {
		it('checkIsTitleUnique should throw EntityExistsException', async () => {
			const serviceWithAccess = service as any;
			articleRepository.findIfExistTitle.mockResolvedValue('anytitle');
			await expect(serviceWithAccess.checkIsTitleUnique('test')).rejects.toThrow(
				EntityExistsException,
			);
		});

		it('checkIsUserAuthor should throw ActionIsForbiddenForUserException', () => {
			const serviceWithAccess = service as any;
			expect(() => serviceWithAccess.checkIsUserAuthor(2, 'other@test.com', mockUserDto)).toThrow(
				ActionIsForbiddenForUserException,
			);
		});
	});
});
