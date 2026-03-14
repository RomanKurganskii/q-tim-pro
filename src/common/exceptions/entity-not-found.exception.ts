import { NotFoundException } from '@nestjs/common';
import { ENTITY_EXCEPTION_TEXT } from '../../common/consts/error-message.const';

export class EntityNotFoundException extends NotFoundException {
	constructor(entityName: string, reasons: Array<[string, unknown]>) {
		super(ENTITY_EXCEPTION_TEXT(entityName, reasons, false));
	}
}
