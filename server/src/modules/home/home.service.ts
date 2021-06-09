import { getRepository } from 'typeorm'
import { Video } from '../video/video.model'

class HomeService {
	public async getVideos(isAuth: boolean, userId: number): Promise<Video[]> {
		return await getRepository(Video)
			.createQueryBuilder(`video`)
			.leftJoin(`video.permissions`, `permission`)
			.where(`video.type = 'READ_ALL'`)
			.orWhere(`video.type = 'READ_AUTH' and :isAuth=true`, { isAuth })
			.orWhere(
				`video.type = 'READ_CHOSEN' and permission.user_id = :userId and
			permission.video_id = video.id`,
				{ userId }
			)
			.orWhere(`video.type = 'READ_CHOSEN' and video.user_id = :userId`, {
				userId,
			})
			.orWhere(
				`video.type = 'READ_ADMIN' and permission.user_id = :userId and
			permission.video_id = video.id and permission.type = 'ADMIN'`,
				{ userId }
			)
			.orWhere(`video.type = 'READ_ADMIN' and video.user_id = :userId`, {
				userId,
			})
			.getMany()
	}
}

export const homeService = new HomeService()
