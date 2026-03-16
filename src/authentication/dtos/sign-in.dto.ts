import { OmitType } from '@nestjs/swagger';
import { CreateUserDto } from '../../user/dtos/create-user.dto';

export class SignInDto extends OmitType(CreateUserDto, [
	'firstName',
	'lastName',
	'middleName',
] as const) {}
