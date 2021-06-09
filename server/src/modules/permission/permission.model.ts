import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	BaseEntity,
	ManyToOne,
	JoinColumn,
} from 'typeorm'
import { User } from '../user/user.model'
import { Video } from '../video/video.model'

@Entity()
export class Permission extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number

	@Column(`int`)
	user_id: number

	@Column(`int`)
	video_id: number
	
	@Column(`varchar`)
	type: string

	@ManyToOne(()=>User, user => user.videos)
	@JoinColumn({ name: `user_id` })
	user: User

	@ManyToOne(()=>Video, video => video.permissions)
	@JoinColumn({ name: `video_id` })
	video: Video
}