import { PaginationInfoDto } from './pagination-info.dto';

export class PaginationResultDto<T> {
	readonly items: T[];
	readonly paginationInfo: PaginationInfoDto;
}
