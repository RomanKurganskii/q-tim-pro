import { ApiProperty } from '@nestjs/swagger';
import { IdDto } from '../../common/dtos/id-dto';
import { IsString, MaxLength, MinLength } from 'class-validator';
import { IsStrongPassword } from '../decorators/is-strong-password.decorator';

export class ChangeUserPasswordDto extends IdDto {
	@ApiProperty({
		description: 'Пароль пользователя',
		example: 'Abc12345678',
		required: true,
		type: String,
	})
	@IsString()
	@MinLength(8)
	@MaxLength(50)
	@IsStrongPassword()
	password: string;

	@ApiProperty({
		description: 'Старый пароль пользователя',
		example: 'Abc12345678',
		required: true,
		type: String,
	})
	@IsString()
	@MinLength(8)
	@MaxLength(50)
	@IsStrongPassword()
	oldPassword: string;
}
