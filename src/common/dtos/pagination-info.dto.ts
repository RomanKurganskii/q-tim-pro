export class PaginationInfoDto {
	readonly totalItems: number;
	readonly totalPages: number;
	readonly page: number;
	readonly perPage: number;
	readonly hasNextPage: boolean;
	readonly hasPreviousPage: boolean;
}
