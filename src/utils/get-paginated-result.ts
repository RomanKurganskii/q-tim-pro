import { PaginationInfoDto } from '../common/dtos/pagination-info.dto';
import { PaginationResultDto } from '../common/dtos/pagination-result.dto';

export function getPaginatedResult<T>(
	items: T[],
	count: number,
	limit = 0,
	skip = 0,
): PaginationResultDto<T> {
	const paginationInfo = getPaginationInfo(items, count, limit, skip);
	return { items, paginationInfo };
}

function getPaginationInfo<T>(items: T[], count: number, limit = 0, skip = 0): PaginationInfoDto {
	const totalPages = Math.ceil(count / limit);
	return {
		totalItems: count,
		totalPages,
		page: skip + 1,
		perPage: items.length,
		hasNextPage: skip + 1 < totalPages,
		hasPreviousPage: skip + 1 > 1,
	};
}
