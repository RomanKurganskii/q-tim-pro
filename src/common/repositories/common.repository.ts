import { BaseEntity, Repository } from 'typeorm';
import { SelectQueryBuilder } from 'typeorm/browser';

export abstract class CommonRepository<T extends BaseEntity> extends Repository<T> {
	constructor(
		protected readonly repo: Repository<T>,
		protected readonly alias: string,
	) {
		super(repo.target, repo.manager, repo.queryRunner);
	}

	async findByIdsWithRelations(ids: number[], relations?: Record<string, boolean>): Promise<T[]> {
		const query = this.repo
			.createQueryBuilder(this.alias)
			.where(`${this.alias}.id IN (:...ids)`, { ids });

		this.addRelations(query, relations);
		return query.getMany();
	}

	protected addRelations(query: SelectQueryBuilder<T>, relations?: Record<string, boolean>): void {
		if (!relations) return;

		Object.entries(relations).forEach(([relation, include]) => {
			if (include) {
				query.leftJoinAndSelect(`${this.alias}.${relation}`, relation);
			}
		});
	}
}
