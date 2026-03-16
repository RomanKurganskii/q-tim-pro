import { IsDefined, IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsStrongPassword } from '../decorators/is-strong-password.decorator';

export class CreateUserDto {
	@ApiProperty({
		description: 'Почта пользователя',
		example: 'test@mail.ru',
		required: true,
		type: String,
	})
	@IsDefined()
	@IsEmail()
	email: string;

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
		description: 'Фамилия пользователя',
		example: 'Петров',
		required: false,
		nullable: true,
		type: String,
	})
	@IsOptional()
	@IsString()
	@MinLength(3)
	lastName?: string;

	@ApiProperty({
		description: 'Имя пользователя',
		example: 'Петр',
		required: false,
		nullable: true,
		type: String,
	})
	@IsOptional()
	@IsString()
	@MinLength(2)
	firstName?: string;

	@ApiProperty({
		description: 'Отчество пользователя',
		example: 'Петрович',
		required: false,
		nullable: true,
		type: String,
	})
	@IsOptional()
	@IsString()
	@MinLength(5)
	middleName?: string;
}
