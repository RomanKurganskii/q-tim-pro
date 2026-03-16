import { applyDecorators, Type } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation } from '@nestjs/swagger';

export const ApiBodyOperation = <TBody extends Type<any>, TResponse extends Type<any>>(
	summary: string,
	bodyDto: TBody,
	responseDto: TResponse,
	description: string,
) =>
	applyDecorators(
		ApiOperation({ summary }),
		ApiBody({
			description,
			type: bodyDto,
			required: true,
		}),
		ApiOkResponse({ type: responseDto }),
	);
