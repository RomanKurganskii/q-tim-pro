import { BadRequestException } from '@nestjs/common';
import { PASSWORD_IS_SAME } from '../consts/error-message.const';

export class PasswordIsSameException extends BadRequestException {
	constructor() {
		super(PASSWORD_IS_SAME);
	}
}
