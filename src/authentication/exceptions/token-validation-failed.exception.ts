import { UnauthorizedException } from '@nestjs/common';
import { TokenErrorType } from '../enums/token-error-type.enum';
import { TOKEN_VALIDATION_FAILED_TEXT } from '../consts/error-message.const';

export class TokenValidationFailedException extends UnauthorizedException {
	constructor(type: TokenErrorType) {
		super(TOKEN_VALIDATION_FAILED_TEXT(type));
	}
}
