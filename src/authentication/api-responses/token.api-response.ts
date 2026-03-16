import { ApiProperty } from '@nestjs/swagger';

export class TokenApiResponse {
	@ApiProperty({
		description: 'Токен',
		example: 'gafdkjghk2QkjewnfN#KRWJNkrw3r33',
		type: String,
	})
	token: string;
}
