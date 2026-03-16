import { IntersectionType } from '@nestjs/swagger';
import { IdsDto } from '../../common/dtos/id-dto';
import { ArticleRelationsDto } from './article-relations.dto';

export class GetArticlesDto extends IntersectionType(IdsDto, ArticleRelationsDto) {}
