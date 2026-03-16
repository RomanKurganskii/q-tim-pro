import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	Query,
	Req,
	UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ARTICLE_ENTITY_NAME } from '../consts/article.const';
import { ArticleService } from '../services/article.service';
import { ApiBodyOperation } from '../../common/swagger-decorators/api-body-operation.swagger-decorator';
import { ArticleApiResponse } from '../api-responses/article.api-response';
import { CreateArticleDto } from '../dtos/create-article.dto';
import { AuthenticationGuard } from '../../authentication/guards/authentication.guard';
import { UserFromRequest } from '../../authentication/interfaces/user-from-request.interface';
import { ArticleEntity } from '../entities/article.entity';
import { UpdateArticleDto } from '../dtos/update-article.dto';
import { PaginationResultApiResponse } from '../../common/api-responses/pagination-result.api-response';
import { GetArticlePaginatedDto } from '../dtos/get-article-paginated.dto';
import { PaginationResultDto } from '../../common/dtos/pagination-result.dto';
import { IdDto } from '../../common/dtos/id-dto';
import { ArticleRelationsDto } from '../dtos/article-relations.dto';
import { GetArticlesDto } from '../dtos/get-articles.dto';

@ApiTags(`${ARTICLE_ENTITY_NAME} (article)`)
@ApiBearerAuth()
@Controller('article')
export class ArticleController {
	constructor(private readonly articleService: ArticleService) {}

	@ApiBodyOperation('Создание', CreateArticleDto, ArticleApiResponse, 'Данные для создания статьи')
	@Post('/create')
	@UseGuards(AuthenticationGuard)
	async create(
		@Body() dto: CreateArticleDto,
		@Req() req: { user: UserFromRequest },
	): Promise<ArticleEntity> {
		return this.articleService.create(dto, req.user);
	}

	@ApiBodyOperation(
		'Обновление',
		UpdateArticleDto,
		ArticleApiResponse,
		'Данные для обновления статьи',
	)
	@Patch('/update')
	@UseGuards(AuthenticationGuard)
	async update(
		@Body() dto: UpdateArticleDto,
		@Req() req: { user: UserFromRequest },
	): Promise<ArticleEntity> {
		return this.articleService.update(dto, req.user);
	}

	@ApiOperation({ summary: 'Получение с пагинацией' })
	@ApiOkResponse({ type: PaginationResultApiResponse(ArticleApiResponse) })
	@Get('/paginated')
	async getAllPaginated(
		@Query() dto: GetArticlePaginatedDto,
	): Promise<PaginationResultDto<ArticleEntity>> {
		return this.articleService.getAllPaginated(dto);
	}

	@ApiOperation({ summary: 'Получение по id' })
	@ApiOkResponse({ type: ArticleApiResponse })
	@Get(':id')
	async getById(@Param() { id }: IdDto, @Query() dto: ArticleRelationsDto): Promise<ArticleEntity> {
		return this.articleService.getById(id, dto);
	}

	@ApiOperation({ summary: 'Получение по массиву id' })
	@ApiOkResponse({ type: ArticleApiResponse, isArray: true })
	@Get()
	async getByIds(@Query() dto: GetArticlesDto): Promise<ArticleEntity[]> {
		return this.articleService.getByIds(dto.ids, { author: dto.author });
	}

	@ApiOperation({ summary: 'Мягкое удаление' })
	@ApiOkResponse()
	@UseGuards(AuthenticationGuard)
	@Delete(':id/soft')
	async softDelete(@Param() { id }: IdDto, @Req() req: { user: UserFromRequest }): Promise<void> {
		await this.articleService.softDelete(id, req.user);
	}

	@ApiOperation({ summary: 'Удаление' })
	@ApiOkResponse()
	@UseGuards(AuthenticationGuard)
	@Delete(':id')
	async delete(@Param() { id }: IdDto, @Req() req: { user: UserFromRequest }): Promise<void> {
		await this.articleService.delete(id, req.user);
	}
}
