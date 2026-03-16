import { IsBoolean, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { PaginationInputDto } from '../../common/dtos/pagination-input.dto';
import { UserRelationsDto } from './user-relations.dto';
import { transformBooleanFromString } from '../../utils/transform-boolean-from-string';

export class GetUserPaginatedDto extends IntersectionType(PaginationInputDto, UserRelationsDto) {
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
}
