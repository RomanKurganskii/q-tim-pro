import { ApiProperty } from '@nestjs/swagger';

export class TimestampedBaseApiResponse {
	@ApiProperty({
		example: new Date(),
		description: 'Дата создания записи',
		type: Date,
	})
	createdAt: Date;

	@ApiProperty({
		example: new Date(),
		description: 'Дата обновления записи',
		type: Date,
	})
	updatedAt: Date;
}
