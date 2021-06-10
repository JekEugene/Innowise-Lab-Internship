import { Video } from './video.model'
import fs from 'fs'
import { videoRepository } from './video.repository'
import { permissionRepository } from '../permission/permission.repository'
import { Permission } from '../permission/permission.model'
import { ICreatePermissionDto } from './dto/create-permission.dto'
import { ICreateVideoDto } from './dto/create-video.dto'
import { IUpdateVideoDto } from './dto/update-video.dto'
import { logger } from '../../config/logger'
import { ValidationError } from '../../error/ValidationError'
import { NotFoundError } from '../../error/NotFoundError'
import { ForbiddenError } from '../../error/ForbiddenError'
class VideoService {
	public async deletePermission(permissionId: number): Promise<void> {
		permissionRepository.deletePermission(permissionId)
	}

	public async deleteVideo(videoId: number): Promise<void> {
		videoRepository.deleteVideo(videoId)
	}

	public async updateVideo(
		videoId: number,
		updateVideo: IUpdateVideoDto
	): Promise<void> {
		videoRepository.updateVideo(videoId, updateVideo)
	}

	public async getVideo(videoId: number): Promise<Video> {
		const video: Video = await videoRepository.getVideo(videoId)
		if (!video) {
			throw new NotFoundError(`A video with the specified ID was not found`)
		}
		return video
	}

	public async createVideo(createVideo: ICreateVideoDto): Promise<void> {
		videoRepository.createVideo(createVideo)
	}

	public async getAllVideos(isAuth: boolean, userId: number): Promise<Video[]> {
		return await videoRepository.getAllVideos(isAuth, userId)
	}

	public async createPermission(
		createPermission: ICreatePermissionDto
	): Promise<void> {
		permissionRepository.createPermission(createPermission)
	}

	public async getVideoPermissions(videoId: number): Promise<Permission[]> {
		return await permissionRepository.getVideoPermissions(videoId)
	}

	public async validateUpdate(
		userId: number,
		videoId: number
	): Promise<boolean> {
		const video: Video = await videoRepository.getVideo(videoId)
		return video.user_id === userId ? true : false
	}

	public async validateIsUserHavePermission(
		userId: number,
		videoId: number
	): Promise<void> {
		const video: Video = await videoRepository.getVideoWithPermissions(videoId)
		if (!video) {
			throw new NotFoundError(`A video with the specified ID was not found`)
		}
		if (video.user_id === userId) {
			return
		}
		const isUserHavePermission: boolean = video.permissions.some((permission) => {
			if (permission.user_id === userId && permission.type === `ADMIN`) {
				return true
			} else {
				return false
			}
		})
		if (!isUserHavePermission) {
			throw new ForbiddenError(`you don't have permissions of this video`)
		}
		return
	}

	public async validateIsUserCanWatch(
		userId: number,
		videoId: number
	): Promise<void> {
		const video: Video = await videoRepository.getVideoWithPermissions(videoId)
		if (video.user_id === userId) {
			return
		}
		switch (video.type) {
		case `READ_ALL`:
			return
		case `READ_AUTH`:
			if (!userId) {
				throw new ForbiddenError(
					`You don't have permission to watch this video`
				)
			}
			return
		case `READ_CHOSEN`: {
			const isUserCanWatch: boolean = video.permissions.some((permission) => {
				if (permission.user_id === userId) {
					return true
				} else {
					return false
				}
			})
			if (!isUserCanWatch) {
				throw new ForbiddenError(
					`You don't have permission to watch this video`
				)
			}
			return
		}
		case `READ_ADMIN`: {
			const isUserCanWatch: boolean = video.permissions.some((permission) => {
				if (permission.user_id === userId && permission.type === `ADMIN`) {
					return true
				} else {
					return false
				}
			})
			if (!isUserCanWatch) {
				throw new ForbiddenError(
					`You don't have permission to watch this video`
				)
			}
			return
		}
		default:
			throw new ForbiddenError(
				`You don't have permission to watch this video`
			)
		}
	}

	public async validateVideoType(type: string): Promise<void> {
		const videoTypes: string[] = [
			`READ_ALL`,
			`READ_AUTH`,
			`READ_CHOSEN`,
			`READ_ADMIN`,
		]
		if (videoTypes.includes(type)) return
		else throw new ValidationError(`incorrect video type`)
	}

	public async validateId(userId: number): Promise<void> {
		if (!Number.isInteger(userId)) {
			throw new ValidationError(
				`The specified user ID is invalid (e.g. not an integer)`
			)
		}
	}

	public isFiledataExists(filedata) {
		if (!filedata) {
			throw new ValidationError(`Error uploading file`)
		}
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
