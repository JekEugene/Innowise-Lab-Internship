
import { ICreateVideoDto } from './dto/create-video.dto'
import { IUpdateVideoDto } from './dto/update-video.dto'
import { Permission } from './permissions.model'
import { Video } from './videos.model'
import fs from 'fs'
import { logger } from '../middleware/logger'
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
	
	public async validateVideoType(type: string): Promise<boolean> {
		const videoTypes: string[] = [`READ_ALL`, `READ_AUTH`, `READ_CHOSEN`, `READ_ADMIN`]
		if(videoTypes.includes(type))
			return true
		else
			return false
	}

	public async deleteVideoFile<T>(arg: T): Promise<void> {
		if (typeof arg === `string`) {
			const link: string = arg
			fs.unlink(`../client/video/${link}`, (err) => {
				logger.error(``, err)
			})
			return
		}
		if (typeof arg === `number`) {
			const videoId: number = arg
			const video: Video = await Video.findOne(videoId)
			fs.unlink(`../client/video/${video.link}`, (err) => {
				logger.error(``, err)
			})
		}
	}
}

export const videoService = new VideoService()
