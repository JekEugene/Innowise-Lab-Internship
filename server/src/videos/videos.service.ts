import { ICreateVideoDto } from './dto/create-video.dto'
import { IUpdateVideoDto } from './dto/update-video.dto'
import { Permission } from './permissions.model'
import { Video } from './videos.model'
class VideoService {
	public async createVideo(newVideo: ICreateVideoDto): Promise<void> {
		Video.create(newVideo).save()
	}

	public async getVideo(id: number): Promise<Video> {
		return await Video.findOne(id)
	}

	public async updateVideo(id: number, updateVideo: IUpdateVideoDto): Promise<void> {
		await Video.update({ id },{ ...updateVideo })
	}
	
	public async validateUpdate(userId: number, videoId: number): Promise<boolean> {
		const video: Video = await Video.findOne(videoId)
		return video.user_id === userId ? true : false
	}

	public async deleteVideo(id: number): Promise<void> {
		Permission.delete({ video_id: id })
		Video.delete(id)
	}
	
	public async validateIsUserHavePermission(userId: number, videoId: number): Promise<boolean> {
		const video: Video = await Video.findOne(videoId, {relations: [`permissions`]})
		
		if (video.user_id === userId) {
			return true
		}
		return video.permissions.some(permission => {
			if (permission.user_id === userId && permission.type === `ADMIN`) {
				return true
			} else {
				return false
			}
		})
	}

	public async validateIsUserCanWatch(userId: number, videoId: number): Promise<boolean> {
		const video: Video = await Video.findOne(videoId, { relations: [`permissions`] })
		if (video.user_id === userId) {
			return true
		}
		switch (video.type) {
		case `READ_ALL`:
			return true
		case `READ_AUTH`:
			return userId ? true : false
		case `READ_CHOSEN`:
			return video.permissions.some(permission => {
				if (permission.user_id === userId) {
					return true
				} else {
					return false
				}
			})
		case `READ_ADMIN`:
			return video.permissions.some(permission => {
				if (permission.user_id === userId && permission.type === `ADMIN`) {
					return true
				} else {
					return false
				}
			})	
		default:
			return false
		}
	}
}

export const videoService = new VideoService()
