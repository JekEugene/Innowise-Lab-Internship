import { getRepository } from 'typeorm'
import { Video } from '../videos/videos.model'

class HomeService {
	public async getVideos(isAuth: boolean, userId: number): Promise<Video[]> {
		return await getRepository(Video).createQueryBuilder(`video`)
			.leftJoin(`video.permissions`, `permission`)
			.where(`video.type = 'READ_ALL'`)
			.orWhere(`video.type = 'READ_AUTH' and :isAuth=true`, { isAuth })
			.orWhere(`video.type = 'READ_CHOSEN' and permission.userId = :userId and
			permission.videoId = video.id`, { userId })
			.orWhere(`video.type = 'READ_CHOSEN' and video.userId = :userId`, { userId })
			.orWhere(`video.type = 'READ_ADMIN' and permission.userId = :userId and
			permission.videoId = video.id and permission.type = 'ADMIN'`, { userId })
			.orWhere(`video.type = 'READ_ADMIN' and video.userId = :userId`, { userId })
			.getMany()
	}
}

export const homeService = new HomeService()