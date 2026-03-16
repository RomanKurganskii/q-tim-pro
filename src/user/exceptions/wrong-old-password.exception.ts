import { BadRequestException } from '@nestjs/common';
import { WRONG_OLD_PASSWORD } from '../consts/error-message.const';

export class WrongOldPasswordException extends BadRequestException {
	constructor() {
		super(WRONG_OLD_PASSWORD);
	}
}
