import { BaseEntity, CreateDateColumn, DeleteDateColumn, UpdateDateColumn } from 'typeorm';

export abstract class TimestampedBaseEntity extends BaseEntity {
	@CreateDateColumn({
		type: 'timestamp',
		comment: 'Дата создания записи',
	})
	createdAt: Date;

	@UpdateDateColumn({ type: 'timestamp', comment: 'Дата обновления записи' })
	updatedAt: Date;

	@DeleteDateColumn({ type: 'timestamp', comment: 'Дата "мягкого" удаления записи' })
	deletedAt?: Date;
}
