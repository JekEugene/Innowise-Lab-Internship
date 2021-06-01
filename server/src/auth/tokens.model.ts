import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	BaseEntity,
	ManyToOne,
	JoinColumn,
} from "typeorm"
import { User } from "../users/users.model"

@Entity()
export class Token extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number

	@Column()
	user_id: number

	@Column()
	token: string
	
	@ManyToOne(()=>User, user => user.tokens)
	@JoinColumn({ name: `user_id` })
	user: User
}