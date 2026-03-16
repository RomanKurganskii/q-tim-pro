import { Test, TestingModule } from '@nestjs/testing';
import { ArticleController } from '../controllers/article.controller';
import { ArticleService } from '../services/article.service';
import { CreateArticleDto } from '../dtos/create-article.dto';
import { UpdateArticleDto } from '../dtos/update-article.dto';
import { GetArticlePaginatedDto } from '../dtos/get-article-paginated.dto';
import { GetArticlesDto } from '../dtos/get-articles.dto';
import { IdDto } from '../../common/dtos/id-dto';
import { ArticleRelationsDto } from '../dtos/article-relations.dto';
import { ArticleEntity } from '../entities/article.entity';
import { PaginationResultDto } from '../../common/dtos/pagination-result.dto';
import { UserFromRequest } from '../../authentication/interfaces/user-from-request.interface';
import { UserEntity } from '../../user/entities/user.entity';
import { AuthenticationGuard } from '../../authentication/guards/authentication.guard';

describe('ArticleController', () => {
	let controller: ArticleController;
	let articleService: jest.Mocked<ArticleService>;

	const mockArticle = {
		id: 1,
		title: 'Test Article',
		description: 'Content',
		author: { id: 1, email: 'author@test.com' } as UserEntity,
		active: true,
		publicDate: new Date(),
	} as ArticleEntity;

	const mockUser: UserFromRequest = {
		id: 1,
		email: 'author@test.com',
		iat: 123454,
		exp: 352135,
	};

	const mockPaginatedResult: PaginationResultDto<ArticleEntity> = {
		items: [mockArticle],
		paginationInfo: {
			totalItems: 1,
			totalPages: 1,
			page: 1,
			perPage: 1,
			hasNextPage: false,
			hasPreviousPage: false,
		},
	};

	beforeEach(async () => {
		const mockArticleService = {
			create: jest.fn(),
			update: jest.fn(),
			getAllPaginated: jest.fn(),
			getById: jest.fn(),
			getByIds: jest.fn(),
			delete: jest.fn(),
			softDelete: jest.fn(),
		};

		const module: TestingModule = await Test.createTestingModule({
			controllers: [ArticleController],
			providers: [
				{
					provide: ArticleService,
					useValue: mockArticleService,
				},
			],
		})
			.overrideGuard(AuthenticationGuard)
			.useValue({ canActivate: jest.fn().mockReturnValue(true) })
			.compile();

		controller = module.get<ArticleController>(ArticleController);
		articleService = module.get(ArticleService);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('create', () => {
		it('should call service.create with correct dto and user', async () => {
			const dto: CreateArticleDto = {
				title: 'New Article',
				description: 'Content',
				authorId: 1,
				active: true,
			};
			const req = { user: mockUser };
			articleService.create.mockResolvedValue(mockArticle);
			const result = await controller.create(dto, req);
			expect(articleService.create).toHaveBeenCalledWith(dto, mockUser);
			expect(result).toEqual(mockArticle);
		});
	});

	describe('update', () => {
		it('should call service.update with correct dto and user', async () => {
			const dto: UpdateArticleDto = {
				id: 1,
				title: 'Updated Article',
				publicArticle: true,
			};
			const req = { user: mockUser };
			articleService.update.mockResolvedValue(mockArticle);

			const result = await controller.update(dto, req);

			expect(articleService.update).toHaveBeenCalledWith(dto, mockUser);
			expect(result).toEqual(mockArticle);
		});
	});

	describe('getAllPaginated', () => {
		it('should call service.getAllPaginated with query dto', async () => {
			const dto: GetArticlePaginatedDto = {
				skip: 0,
				limit: 10,
				active: true,
			};
			articleService.getAllPaginated.mockResolvedValue(mockPaginatedResult);

			const result = await controller.getAllPaginated(dto);

			expect(articleService.getAllPaginated).toHaveBeenCalledWith(dto);
			expect(result).toEqual(mockPaginatedResult);
		});
	});

	describe('getById', () => {
		it('should call service.getById with id and relations dto', async () => {
			const params: IdDto = { id: 1 };
			const query: ArticleRelationsDto = { author: true };
			articleService.getById.mockResolvedValue(mockArticle);

			const result = await controller.getById(params, query);

			expect(articleService.getById).toHaveBeenCalledWith(1, query);
			expect(result).toEqual(mockArticle);
		});
	});

	describe('getByIds', () => {
		it('should call service.getByIds with ids and relations', async () => {
			const dto: GetArticlesDto = {
				ids: [1, 2, 3],
				author: true,
			};
			const expectedResult = [mockArticle];
			articleService.getByIds.mockResolvedValue(expectedResult);

			const result = await controller.getByIds(dto);

			expect(articleService.getByIds).toHaveBeenCalledWith([1, 2, 3], { author: true });
			expect(result).toEqual(expectedResult);
		});
	});

	describe('softDelete', () => {
		it('should call service.softDelete with id and user', async () => {
			const params: IdDto = { id: 1 };
			const req = { user: mockUser };
			articleService.softDelete.mockResolvedValue(undefined);

			await controller.softDelete(params, req);

			expect(articleService.softDelete).toHaveBeenCalledWith(1, mockUser);
		});
	});

	describe('delete', () => {
		it('should call service.delete with id and user', async () => {
			const params: IdDto = { id: 1 };
			const req = { user: mockUser };
			articleService.delete.mockResolvedValue(undefined);

			await controller.delete(params, req);

			expect(articleService.delete).toHaveBeenCalledWith(1, mockUser);
		});
	});

	describe('DTO validation', () => {
		it('getById should extract id from IdDto correctly', async () => {
			const params: IdDto = { id: 999 };
			const query: ArticleRelationsDto = {};
			articleService.getById.mockResolvedValue(mockArticle as any);

			await controller.getById(params, query);

			expect(articleService.getById).toHaveBeenCalledWith(999, {});
		});
	});
});
