
import { Video } from './video.model'
import fs from 'fs'
import { videoRepository } from './video.repository'
import { permissionRepository } from '../permission/permission.repository'
import { Permission } from '../permission/permission.model'
import { ICreatePermissionDto } from './dto/create-permission.dto'
import { ICreateVideoDto } from './dto/create-video.dto'
import { IUpdateVideoDto } from './dto/update-video.dto'
import { logger } from '../../config/logger'
class VideoService {

	public async deletePermission(permissionId: number): Promise<void> {
		permissionRepository.deletePermission(permissionId)
	}

	public async deleteVideo(videoId: number): Promise<void> {
		videoRepository.deleteVideo(videoId)
	}

	public async updateVideo(videoId: number, updateVideo: IUpdateVideoDto): Promise<void> {
		videoRepository.updateVideo(videoId, updateVideo)
	}

	public async getVideo(videoId: number): Promise<Video> {
		return await videoRepository.getVideo(videoId)
	}

	public async createVideo(createVideo: ICreateVideoDto): Promise<void> {
		videoRepository.createVideo(createVideo)
	}

	public async getAllVideos(isAuth, userId): Promise<Video[]> {
		return await videoRepository.getAllVideos(isAuth, userId)
	}

	public async createPermission(createPermission: ICreatePermissionDto): Promise<void> {
		permissionRepository.createPermission(createPermission)
	}
	
	public async getVideoPermissions(videoId: number): Promise<Permission[]> {
		return await permissionRepository.getVideoPermissions(videoId)
	}

	public async validateUpdate(userId: number, videoId: number): Promise<boolean> {
		const video: Video = await videoRepository.getVideo(videoId)
		return video.user_id === userId ? true : false
	}
	
	public async validateIsUserHavePermission(userId: number, videoId: number): Promise<boolean> {
		const video: Video = await videoRepository.getVideoWithPermissions(videoId)
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
		const video: Video = await videoRepository.getVideoWithPermissions(videoId)
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
			const video: Video = await videoRepository.getVideo(videoId)
			fs.unlink(`../client/video/${video.link}`, (err) => {
				logger.error(``, err)
			})
		}
	}
}

export const videoService = new VideoService()
