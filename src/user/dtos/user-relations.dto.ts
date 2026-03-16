import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';
import { transformBooleanFromString } from '../../utils/transform-boolean-from-string';

export class UserRelationsDto {
	@ApiProperty({
		description: 'Добавить статьи к сущности?',
		example: false,
		required: false,
		nullable: true,
		type: Boolean,
	})
	@IsBoolean()
	@Transform(({ value }) => transformBooleanFromString(value))
	@IsOptional()
	readonly articles?: boolean;
}
