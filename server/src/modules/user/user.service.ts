import { NotFoundError } from '../../error/NotFoundError'
import { ValidationError } from '../../error/ValidationError'
import { Video } from '../video/video.model'
import { videoRepository } from '../video/video.repository'
import { User } from './user.model'
import { userRepository } from './user.repository'

class UserService {
	public async getAllUsers(): Promise<User[]> {
		return await userRepository.getAllUsers()
	}

	public async getUserVideos(
		isAuth: boolean,
		reqUserId: number,
		userId: number
	): Promise<Video[]> {
		this.validateId(reqUserId)
		await this.isUserExist(reqUserId)
		return await this.getAllUserVideos(isAuth, userId, reqUserId)
	}

	private validateId(userId: number): void {
		if (!Number.isInteger(userId)) {
			throw new ValidationError(
				`The specified user ID is invalid (e.g. not an integer)`
			)
		}
	}

	private async isUserExist(userId: number): Promise<void> {
		const user: User = await userRepository.getUserById(userId)
		if (!user) {
			throw new NotFoundError(`A user with the specified ID was not found`)
		}
	}

	private async getAllUserVideos(
		isAuth: boolean,
		userId: number,
		targetId: number
	): Promise<Video[]> {
		return await videoRepository.getAllUserVideos(isAuth, userId, targetId)
	}
}

export const userService = new UserService()
