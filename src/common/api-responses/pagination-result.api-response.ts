import { ApiProperty } from '@nestjs/swagger';
import { Type } from '@nestjs/common';

class PaginationInfo {
	@ApiProperty({ example: 100, description: 'Общее количество элементов', type: Number })
	totalItems: number;

	@ApiProperty({ example: 10, description: 'Общее количество страниц', type: Number })
	totalPages: number;

	@ApiProperty({ example: 1, description: 'Текущая страница', type: Number })
	page: number;

	@ApiProperty({ example: 10, description: 'Количество элементов на странице', type: Number })
	perPage: number;

	@ApiProperty({ example: true, description: 'Есть ли следующая страница', type: Boolean })
	hasNextPage: boolean;

	@ApiProperty({ example: false, description: 'Есть ли предыдущая страница', type: Boolean })
	hasPreviousPage: boolean;
}

export function PaginationResultApiResponse<T>(itemType: Type<T>) {
	class ItemsWithPagination {
		@ApiProperty({ type: [itemType], description: 'Список элементов' })
		items: T[];

		@ApiProperty({
			type: PaginationInfo,
			description: 'Информация о пагинации',
		})
		paginationInfo: PaginationInfo;
	}

	const baseName = itemType.name.replace(/ApiResponse$/, '');
	const uniqueName = `${baseName}ItemsWithPagination`;
	Object.defineProperty(ItemsWithPagination, 'name', { value: uniqueName });

	return ItemsWithPagination;
}
