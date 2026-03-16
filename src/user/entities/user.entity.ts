import { Column, Entity, Index, OneToMany, Unique } from 'typeorm';
import { CommonFieldsBaseEntity } from '../../common/entities/common-fields-base.entity';
import { ArticleEntity } from '../../article/entities/article.entity';

@Unique(['email'])
@Index(['email'])
@Entity(UserEntity.entityName)
export class UserEntity extends CommonFieldsBaseEntity {
	static entityName = 'user';

	@Column({ comment: 'Почта пользователя' })
	email: string;

	@Column({ select: false, comment: 'Пароль пользователя' })
	password: string;

	@Column('varchar', { nullable: true, comment: 'Фамилия пользователя' })
	lastName?: string | null;

	@Column('varchar', { nullable: true, comment: 'Имя пользователя' })
	firstName?: string | null;

	@Column('varchar', { nullable: true, comment: 'Отчество пользователя' })
	middleName?: string | null;

	@OneToMany(() => ArticleEntity, (articles) => articles.author, { cascade: true })
	articles: ArticleEntity[];
}
