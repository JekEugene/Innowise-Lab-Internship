import { Video } from '../video/video.model'
import { videoRepository } from '../video/video.repository'
import { User } from './user.model'
import { userRepository } from './user.repository'

class UserService {

	public async isUserExist(userId: number) :Promise<boolean> {
		const user: User = await userRepository.getUserById(userId)
		return user ? true : false
	}
	
	public async getAllUsers(): Promise<User[]> {
		return await userRepository.getAllUsers()
	}

	public async getAllUserVideos(isAuth: boolean, userId: number, targetId: number): Promise<Video[]> {
		return await videoRepository.getAllUserVideos(isAuth, userId, targetId)
	}
}

export const userService = new UserService()



