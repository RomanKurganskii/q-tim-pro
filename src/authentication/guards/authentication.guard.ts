import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenValidationFailedException } from '../exceptions/token-validation-failed.exception';
import { TokenErrorType } from '../enums/token-error-type.enum';
import { UserFromRequest } from '../interfaces/user-from-request.interface';

@Injectable()
export class AuthenticationGuard implements CanActivate {
	constructor(private readonly jwtService: JwtService) {}

	canActivate(context: ExecutionContext): boolean {
		const req: { headers: { authorization: string }; user: UserFromRequest } = context
			.switchToHttp()
			.getRequest();
		if (!req?.headers?.authorization) {
			return false;
		}
		req.user = this.validateToken(req.headers.authorization);
		return true;
	}

	validateToken(authorization: string) {
		if (authorization.split(' ')[0] !== 'Bearer') {
			throw new TokenValidationFailedException(TokenErrorType.INVALID_TYPE);
		}
		const token = authorization.split(' ')[1];
		try {
			return this.jwtService.verify<UserFromRequest>(token);
		} catch {
			throw new TokenValidationFailedException(TokenErrorType.EXPIRED);
		}
	}
}
