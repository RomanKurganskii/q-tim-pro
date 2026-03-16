import { BadRequestException } from '@nestjs/common';

export function transformBooleanFromString(value: string): boolean {
	if (value?.toLowerCase() === 'true') {
		return true;
	}
	if (value?.toLowerCase() === 'false') {
		return false;
	}
	throw new BadRequestException('Input is not boolean string');
}
