import { BaseEntity, Column, CreateDateColumn, PrimaryColumn } from 'typeorm';

export abstract class ParsedProductBaseEntity extends BaseEntity {
	@PrimaryColumn({ comment: 'Id файла поставщика' })
	supplierFileId: number;

	@PrimaryColumn({ comment: 'Id продукта поставщика' })
	supplierProductId: string;

	@CreateDateColumn({ type: 'timestamp', comment: 'Дата создания записи' })
	createdAt: Date;

	@Column({ comment: 'Id поставщика' })
	supplierId: number;

	@Column({ comment: 'Id склада' })
	warehouseId: number;
}
