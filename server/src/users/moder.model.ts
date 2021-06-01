import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	BaseEntity,
} from "typeorm"

@Entity()
export class Moder extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number

	@Column()
	user_id: number

	@Column()
	video_id: number
}