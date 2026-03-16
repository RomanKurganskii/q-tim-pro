import { Column, Entity, Index, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { CommonFieldsBaseEntity } from '../../common/entities/common-fields-base.entity';
import { UserEntity } from '../../user/entities/user.entity';

@Unique(['title'])
@Index(['title'])
@Entity(ArticleEntity.entityName)
export class ArticleEntity extends CommonFieldsBaseEntity {
	static entityName = 'article';

	@Column({ comment: 'Название статьи' })
	title: string;

	@Column({ comment: 'Описание статьи' })
	description: string;

	@Column('timestamp', { nullable: true, comment: 'Дата публикации статьи' })
	publicDate: Date | null;

	@JoinColumn()
	@ManyToOne(() => UserEntity, (author) => author.articles, { onDelete: 'CASCADE' })
	author: UserEntity;
}
