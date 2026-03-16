import { ForbiddenException } from '@nestjs/common';
import { ACTION_IS_FORBIDDEN_FOR_USER } from '../consts/error-message.const';

export class ActionIsForbiddenForUserException extends ForbiddenException {
	constructor() {
		super(ACTION_IS_FORBIDDEN_FOR_USER);
	}
}
