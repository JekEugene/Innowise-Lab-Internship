import { Brackets, getRepository } from 'typeorm'
import { ICreateVideoDto } from './dto/create-video.dto'
import { IUpdateVideoDto } from './dto/update-video.dto'
import { Permission } from '../permission/permission.model'
import { Video } from './video.model'

class VideoRepository {
	public async createVideo(createVideo: ICreateVideoDto) {
		return Video.create({...createVideo, user_id: createVideo.userId}).save()
	}

	public async getVideo(videoId: number) {
		return await Video.findOne(videoId)
	}
	
	public async getVideoWithPermissions(videoId: number) {
		return await Video.findOne(videoId, {relations: [`permissios`]})
	}

	public async getAllVideos(isAuth: boolean, userId: number) {
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

	public async getAllUserVideos(isAuth: boolean, userId: number, targetId: number) {
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
	}

	public async updateVideo(id: number, updateVideo: IUpdateVideoDto): Promise<void> {
		await Video.update({ id },{ ...updateVideo })
	}

	public async deleteVideo(id: number): Promise<void> {
		Permission.delete({ video_id: id })
		Video.delete(id)
	}
}

export const videoRepository = new VideoRepository()