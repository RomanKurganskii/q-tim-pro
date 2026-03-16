import { TokenErrorType } from '../enums/token-error-type.enum';

export const USER_IS_NOT_ACTIVE = 'Указанный пользователь не активен';
export const WRONG_PASSWORD_OR_EMAIL = 'Неверный пароль или email';
export const TOKEN_VALIDATION_FAILED_TEXT = (type: TokenErrorType) => {
	let errorMessage = '';
	if (type === TokenErrorType.EXPIRED) {
		errorMessage = 'Недействительный токен';
	}
	if (type === TokenErrorType.INVALID_TYPE) {
		errorMessage = 'Неверный тип токена';
	}
	return 'Ошибка валидации токена - ' + errorMessage;
};
