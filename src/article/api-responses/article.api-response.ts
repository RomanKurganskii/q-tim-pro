import { ApiProperty } from '@nestjs/swagger';
import { CommonFieldsBaseApiResponse } from '../../common/api-responses/common-fields-base.api-response';
import { USER_ENTITY_NAME } from '../../user/consts/user.const';
import { UserApiResponse } from '../../user/api-responses/user.api-reponse';

export class ArticleApiResponse extends CommonFieldsBaseApiResponse {
	@ApiProperty({
		description: 'Название статьи',
		example: 'Статья про уток',
		type: String,
	})
	title: string;

	@ApiProperty({
		description: 'Описание статьи',
		example: 'Какое-то описание',
		type: String,
	})
	description: string;

	@ApiProperty({
		nullable: true,
		description: 'Дата публикации статьи',
		example: new Date(),
		type: Date,
	})
	publicDate: Date | null;

	@ApiProperty({
		type: ArticleApiResponse,
		nullable: false,
		description: USER_ENTITY_NAME,
	})
	author: UserApiResponse;
}
