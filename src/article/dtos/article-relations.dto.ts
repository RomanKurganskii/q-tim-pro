import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';
import { transformBooleanFromString } from '../../utils/transform-boolean-from-string';

export class ArticleRelationsDto {
	@ApiProperty({
		description: 'Добавить автора к сущности?',
		example: false,
		required: false,
		nullable: true,
		type: Boolean,
	})
	@IsBoolean()
	@Transform(({ value }) => transformBooleanFromString(String(value)))
	@IsOptional()
	readonly author?: boolean;
}
