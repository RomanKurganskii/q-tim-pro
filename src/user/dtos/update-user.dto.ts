import { IsInt, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateUserDto } from './create-user.dto';
import { ApiProperty, OmitType } from '@nestjs/swagger';

export class UpdateUserDto extends OmitType(CreateUserDto, ['email', 'password'] as const) {
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
}
