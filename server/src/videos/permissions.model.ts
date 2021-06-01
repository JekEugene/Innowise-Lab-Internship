import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	BaseEntity,
	ManyToOne,
	JoinColumn,
} from "typeorm"
import { User } from "../users/users.model"
import { Video } from "./videos.model"

@Entity()
export class Permission extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number

	@Column()
	user_id: number

	@Column()
	video_id: number
	
	@Column()
	type: string

	@ManyToOne(()=>User, user => user.videos)
	@JoinColumn({ name: `user_id` })
	user: User

	@ManyToOne(()=>Video, video => video.permissions)
	@JoinColumn({ name: `video_id` })
	video: Video
}