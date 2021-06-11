import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	BaseEntity,
	ManyToOne,
	JoinColumn,
} from 'typeorm'
import { User } from '../user/user.model'

@Entity()
export class Token extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number

	@Column(`int`)
	user_id: number

	@Column(`varchar`)
	token: string

	@ManyToOne(() => User, (user) => user.tokens)
	@JoinColumn({ name: `user_id` })
	user: User
}
