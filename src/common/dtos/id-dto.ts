import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsArray, IsInt, IsPositive } from 'class-validator';

export class IdDto {
	@ApiProperty({
		name: 'id',
		type: Number,
		description: 'id записи',
		example: 143,
		required: true,
	})
	@IsInt()
	@Type(() => Number)
	@IsPositive()
	id: number;
}

export class IdsDto {
	@ApiProperty({
		name: 'ids',
		type: Number,
		description: 'id записей',
		example: [143],
		required: true,
		isArray: true,
	})
	@Transform(({ value }) => {
		if (Array.isArray(value)) {
			return value.map(Number);
		}
		if (typeof value === 'string') {
			return value.split(',').map(Number);
		}
		return [Number(value)];
	})
	@IsArray()
	@IsInt({ each: true })
	@IsPositive({ each: true })
	ids: number[];
}
