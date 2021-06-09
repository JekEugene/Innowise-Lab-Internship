import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	BaseEntity,
	OneToMany,
} from 'typeorm'

import { Video } from '../video/video.model'
import { Token } from '../auth/token.model'
import { Permission } from '../video/permission.model'
@Entity()
export class User extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number

	@Column(`varchar`)
	login: string

  @Column(`varchar`)
	password: string

	@OneToMany(() => Video, video => video.user)
	videos: Video[]

	@OneToMany(() => Token, token => token.user)
	tokens: Token[]

	@OneToMany(() => Permission, permission => permission.user)
	permissions: Permission[]
}