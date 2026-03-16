import {
	IsBoolean,
	IsDate,
	IsInt,
	IsOptional,
	IsPositive,
	IsString,
	MinLength,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { PaginationInputDto } from '../../common/dtos/pagination-input.dto';
import { transformBooleanFromString } from '../../utils/transform-boolean-from-string';
import { ArticleRelationsDto } from './article-relations.dto';

export class GetArticlePaginatedDto extends IntersectionType(
	PaginationInputDto,
	ArticleRelationsDto,
) {
	@ApiProperty({
		description: 'Фильтр по флагу active',
		example: false,
		required: false,
		nullable: true,
		type: Boolean,
	})
	@IsBoolean()
	@Transform(({ value }) => transformBooleanFromString(String(value)))
	@IsOptional()
	active?: boolean;

	@ApiProperty({
		description: 'Фильтр по title',
		example: 'туча',
		required: false,
		nullable: true,
		type: String,
	})
	@IsString()
	@MinLength(1)
	@IsOptional()
	title?: string;

	@ApiProperty({
		required: false,
		nullable: true,
		description: 'id автора',
		example: 1,
		type: Number,
	})
	@IsInt()
	@IsPositive()
	@IsOptional()
	@Type(() => Number)
	authorId: number;

	@ApiProperty({
		example: new Date(),
		description: 'Начало диапазона для фильтра по publicDate',
		required: false,
		nullable: true,
		type: Date,
	})
	@IsOptional()
	@IsDate()
	@Type(() => Date)
	startPublicDate: Date;

	@ApiProperty({
		example: new Date(),
		description: 'Конец диапазона для фильтра по publicDate',
		required: false,
		nullable: true,
		type: Date,
	})
	@IsOptional()
	@IsDate()
	@Type(() => Date)
	endPublicDate: Date;
}
