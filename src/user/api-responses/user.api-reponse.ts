import { ApiProperty } from '@nestjs/swagger';
import { CommonFieldsBaseApiResponse } from '../../common/api-responses/common-fields-base.api-response';

export class UserApiResponse extends CommonFieldsBaseApiResponse {
	@ApiProperty({
		description: 'email',
		example: 'test@mail.ru',
		type: String,
	})
	email: string;

	@ApiProperty({
		nullable: true,
		description: 'Фамилия пользователя',
		example: 'Петров',
		type: String,
	})
	lastName?: string | null;

	@ApiProperty({
		nullable: true,
		description: 'Имя пользователя',
		example: 'Петр',
		type: String,
	})
	firstName?: string | null;

	@ApiProperty({
		nullable: true,
		description: 'Отчество пользователя',
		example: 'Петрович',
		type: String,
	})
	middleName?: string | null;
}
