import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	BaseEntity,
} from "typeorm"
@Entity()
export class Video extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number

	@Column()
  user_id: number

	@Column()
	name: string

  @Column()
  type: string
  
  @Column()
  link: string
}