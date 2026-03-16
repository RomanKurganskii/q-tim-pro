import {
	IsBoolean,
	IsDefined,
	IsInt,
	IsOptional,
	IsPositive,
	IsString,
	MaxLength,
	MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateArticleDto } from './create-article.dto';
import { ApiProperty, OmitType } from '@nestjs/swagger';

export class UpdateArticleDto extends OmitType(CreateArticleDto, [
	'authorId',
	'description',
	'title',
] as const) {
	@ApiProperty({
		required: true,
		description: 'id записи',
		example: 1,
		type: Number,
	})
	@IsInt()
	@IsPositive()
	@Type(() => Number)
	id: number;

	@ApiProperty({
		nullable: true,
		description: 'Опубликовать/Снять с публикации статью',
		type: Boolean,
		example: false,
		required: false,
	})
	@IsBoolean()
	@Type(() => Boolean)
	@IsOptional()
	publicArticle?: boolean;

	@ApiProperty({
		description: 'Название статьи',
		example: 'Про уток',
		required: false,
		nullable: true,
		type: String,
	})
	@IsDefined()
	@IsString()
	@MinLength(5)
	@MaxLength(100)
	@IsOptional()
	title?: string;

	@ApiProperty({
		description: 'Описание статьи',
		example: 'Какое-то описание',
		required: false,
		nullable: true,
		type: String,
	})
	@IsDefined()
	@IsString()
	@MinLength(5)
	@MaxLength(5000)
	@IsOptional()
	description?: string;
}
