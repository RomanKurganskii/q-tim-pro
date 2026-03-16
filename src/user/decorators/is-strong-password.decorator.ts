import {
	registerDecorator,
	ValidatorConstraint,
	ValidatorConstraintInterface,
} from 'class-validator';
import { ValidationOptions } from 'joi';

@ValidatorConstraint({ name: 'isStrongPassword', async: false })
export class IsStrongPasswordConstraint implements ValidatorConstraintInterface {
	validate(password: string) {
		const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
		return regex.test(password);
	}

	defaultMessage() {
		return 'Пароль должен содержать только латинские буквы, как минимум одну заглавную, одну маленькую буквы и одну цифру';
	}
}
export function IsStrongPassword(validationOptions?: ValidationOptions) {
	return function (object: object, propertyName: string) {
		registerDecorator({
			target: object.constructor,
			propertyName: propertyName,
			options: validationOptions,
			constraints: [],
			validator: IsStrongPasswordConstraint,
		});
	};
}
