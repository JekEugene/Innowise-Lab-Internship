import { Brackets, getRepository } from 'typeorm'
import { Video } from '../videos/videos.model'
import { User } from './users.model'

export const userService = {
	async getAllUsers() :Promise<User[]> {
		return await User.find()
	},

	async getUserVideos(isAuth: boolean, userId: number, targetId: number): Promise<Video[]> {
		return await getRepository(Video).createQueryBuilder(`video`)
			.leftJoin(`video.permissions`, `permission`)
			.where(`video.user_id = :targetId`, { targetId })
			.andWhere(new Brackets(qb => {
				qb.where(`video.type = 'READ_ALL'`)
					.orWhere(`video.type = 'READ_AUTH' and :isAuth=true`, { isAuth })
					.orWhere(`video.type = 'READ_CHOSEN' and permission.user_id = :userId and
					permission.video_id = video.id`, { userId })
					.orWhere(`video.type = 'READ_CHOSEN' and video.user_id = :userId`, { userId })
					.orWhere(`video.type = 'READ_ADMIN' and permission.user_id = :userId and
					permission.video_id = video.id and permission.type = 'ADMIN'`, { userId })
					.orWhere(`video.type = 'READ_ADMIN' and video.user_id = :userId`, { userId })
			}))
			.getMany()
	},

	async isUserExist(id: number) :Promise<boolean> {
		const user = await User.findOne(id)
		return user ? true : false
	},
}



