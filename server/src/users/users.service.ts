import { Brackets, getRepository } from 'typeorm'
import { Video } from '../videos/videos.model'
import { User } from './users.model'

class UserService {
	public async getAllUsers() :Promise<User[]> {
		return await User.find()
	}

	public async getUserVideos(isAuth: boolean, userId: number, targetId: number): Promise<Video[]> {
		return await getRepository(Video).createQueryBuilder(`video`)
			.leftJoin(`video.permissions`, `permission`)
			.where(`video.userId = :targetId`, { targetId })
			.andWhere(new Brackets(qb => {
				qb.where(`video.type = 'READ_ALL'`)
					.orWhere(`video.type = 'READ_AUTH' and :isAuth=true`, { isAuth })
					.orWhere(`video.type = 'READ_CHOSEN' and permission.userId = :userId and
					permission.videoId = video.id`, { userId })
					.orWhere(`video.type = 'READ_CHOSEN' and video.userId = :userId`, { userId })
					.orWhere(`video.type = 'READ_ADMIN' and permission.userId = :userId and
					permission.videoId = video.id and permission.type = 'ADMIN'`, { userId })
					.orWhere(`video.type = 'READ_ADMIN' and video.userId = :userId`, { userId })
			}))
			.getMany()
	}

	public async isUserExist(id: number) :Promise<boolean> {
		const user = await User.findOne(id)
		return user ? true : false
	}
}

export const userService = new UserService()



