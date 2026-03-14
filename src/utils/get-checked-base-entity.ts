import { HttpException } from '@nestjs/common';
import { BaseEntity } from 'typeorm';

export function getCheckedBaseEntity<T extends BaseEntity | BaseEntity[], K extends HttpException>(
	entity: T,
	error: K,
	existCheckFlag: boolean,
): T {
	const isEntityExist = (Array.isArray(entity) && !entity.length) || !entity;
	if (isEntityExist !== existCheckFlag) {
		throw error;
	}
	return entity;
}
