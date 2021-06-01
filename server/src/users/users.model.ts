import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	BaseEntity,
	OneToMany,
} from "typeorm"

import { Video } from '../videos/videos.model'
import { Token } from '../auth/tokens.model'
import { Permission } from '../videos/permissions.model'
@Entity()
export class User extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number

	@Column()
	login: string

  @Column()
	password: string

	@OneToMany(() => Video, video => video.user_id)
	videos: Video[]

	@OneToMany(() => Token, token => token.user_id)
	tokens: Token[]

	@OneToMany(() => Permission, permission => permission.user_id)
	permissions: Permission[]
}