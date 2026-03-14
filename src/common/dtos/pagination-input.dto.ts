import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class PaginationInputDto {
	@ApiProperty({
		required: false,
		nullable: true,
		description: 'Пропуск страницы',
		example: 0,
		minimum: 0,
		default: 0,
		type: Number,
	})
	@IsInt()
	@Min(0)
	@Type(() => Number)
	@IsOptional()
	skip: number = 0;

	@ApiProperty({
		required: false,
		nullable: true,
		description: 'Количество записей на странице',
		example: 11,
		minimum: 0,
		maximum: 100,
		default: 50,
		type: Number,
	})
	@IsInt()
	@Min(0)
	@Max(100)
	@Type(() => Number)
	@IsOptional()
	limit: number = 50;
}
