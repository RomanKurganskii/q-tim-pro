import { Column, PrimaryGeneratedColumn } from 'typeorm';
import { TimestampedBaseEntity } from './timestamped-base.entity';

export abstract class CommonFieldsBaseEntity extends TimestampedBaseEntity {
	@PrimaryGeneratedColumn({ comment: 'Id записи' })
	id: number;

	@Column({ default: true, comment: 'Активен ли пользователь' })
	active: boolean;
}
