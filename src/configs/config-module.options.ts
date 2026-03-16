import { ConfigModuleOptions } from '@nestjs/config';
import * as Joi from 'joi';
import { ENV } from '../common/consts/env';

export const configModuleOptions: ConfigModuleOptions = {
	isGlobal: true,
	validationSchema: Joi.object({
		[ENV.NODE_ENV]: Joi.string().required(),
		[ENV.PORT]: Joi.number(),
		[ENV.POSTGRES_HOST]: Joi.string().required(),
		[ENV.POSTGRES_PORT]: Joi.number().required(),
		[ENV.POSTGRES_USER]: Joi.string().required(),
		[ENV.POSTGRES_PASSWORD]: Joi.string().required(),
		[ENV.POSTGRES_DB]: Joi.string().required(),
		[ENV.JWT_SECRET]: Joi.string().required(),
		[ENV.JWT_EXPIRATION_TIME]: Joi.string().required(),
		[ENV.BCRYPT_SALT]: Joi.number().required(),
		[ENV.REDIS_URL]: Joi.string().required(),
		[ENV.REDIS_PORT]: Joi.number().required(),
	}),
};
