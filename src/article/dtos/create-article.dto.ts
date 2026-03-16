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
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateArticleDto {
	@ApiProperty({
		description: 'Название статьи',
		example: 'Про уток',
		required: true,
		type: String,
	})
	@IsDefined()
	@IsString()
	@MinLength(5)
	@MaxLength(100)
	title: string;

	@ApiProperty({
		description: 'Описание статьи',
		example: 'Какое-то описание',
		required: true,
		type: String,
	})
	@IsDefined()
	@IsString()
	@MinLength(5)
	@MaxLength(5000)
	description: string;

	@ApiProperty({
		required: true,
		description: 'id автора',
		example: 1,
		type: Number,
	})
	@IsInt()
	@IsPositive()
	@Type(() => Number)
	authorId: number;

	@ApiProperty({
		default: true,
		description: 'Активна ли статья',
		type: Boolean,
		example: false,
		required: false,
	})
	@IsBoolean()
	@IsOptional()
	@Type(() => Boolean)
	active?: boolean;
}
