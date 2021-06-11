import { DeepPartial } from 'typeorm'
import { User } from '../user.model'
export interface ICreateUserDto extends DeepPartial<User> {
	login: string
	password: string
}
