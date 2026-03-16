import { BadRequestException } from '@nestjs/common';
import { WRONG_PASSWORD_OR_EMAIL } from '../consts/error-message.const';

export class WrongPasswordOrEmailException extends BadRequestException {
	constructor() {
		super(WRONG_PASSWORD_OR_EMAIL);
	}
}
