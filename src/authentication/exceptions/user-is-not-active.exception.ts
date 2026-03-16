import { UnauthorizedException } from '@nestjs/common';
import { USER_IS_NOT_ACTIVE } from '../consts/error-message.const';

export class UserIsNotActiveException extends UnauthorizedException {
	constructor() {
		super(USER_IS_NOT_ACTIVE);
	}
}
