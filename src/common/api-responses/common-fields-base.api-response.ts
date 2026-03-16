import { ApiProperty } from '@nestjs/swagger';
import { TimestampedBaseApiResponse } from './timestamped-base.api-response';

export class CommonFieldsBaseApiResponse extends TimestampedBaseApiResponse {
	@ApiProperty({ description: 'Id записи', example: 1, type: Number })
	id: number;

	@ApiProperty({
		default: true,
		description: 'Активен ли пользователь',
		type: Boolean,
		example: false,
	})
	active: boolean;
}
