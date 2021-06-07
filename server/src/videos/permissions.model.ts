import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	BaseEntity,
	ManyToOne,
	JoinColumn,
} from 'typeorm'
import { User } from '../users/users.model'
import { Video } from './videos.model'

@Entity()
export class Permission extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number

	@Column(`int`)
	userId: number

	@Column(`int`)
	videoId: number
	
	@Column(`varchar`)
	type: string

	@ManyToOne(()=>User, user => user.videos)
	@JoinColumn({ name: `userId` })
	user: User

	@ManyToOne(()=>Video, video => video.permissions)
	@JoinColumn({ name: `videoId` })
	video: Video
}