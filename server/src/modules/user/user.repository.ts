import { ICreateUserDto } from './dto/create-user.dto'
import { User } from './user.model'

class UserRepository {
	public async createUser(user: ICreateUserDto): Promise<User> {
		return await User.create(user).save()
	}

	public async getUserByLogin(login: string): Promise<User> {
		return await User.findOne({ where: { login } })
	}

	public async getUserById(userId: number): Promise<User> {
		return await User.findOne(userId)
	}

	public async getAllUsers(): Promise<User[]> {
		return await User.find()
	}
}

export const userRepository = new UserRepository()
