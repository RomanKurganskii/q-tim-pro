import { ApiProperty } from '@nestjs/swagger';
import { CommonFieldsBaseApiResponse } from '../../common/api-responses/common-fields-base.api-response';
import { ArticleApiResponse } from '../../article/api-responses/article.api-response';
import { ARTICLE_ENTITY_NAME } from '../../article/consts/article.const';

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

	@ApiProperty({
		isArray: true,
		type: ArticleApiResponse,
		nullable: true,
		description: ARTICLE_ENTITY_NAME,
		example: null,
	})
	articles: ArticleApiResponse[];
}
