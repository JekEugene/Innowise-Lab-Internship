import { User } from './user.model'
import { userRepository } from './user.repository'

class UserService {

	public async isUserExist(userId: number) :Promise<boolean> {
		const user: User = await userRepository.getUserById(userId)
		return user ? true : false
	}
}

export const userService = new UserService()



