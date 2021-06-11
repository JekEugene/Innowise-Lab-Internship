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
import { permissionService } from '../permission/permission.service'
class VideoService {
	public async getAllVideos(isAuth: boolean, userId: number): Promise<Video[]> {
		return await videoRepository.getAllVideos(isAuth, userId)
	}

	public async newVideo(
		name: string,
		link: string,
		type: string,
		userId: number,
		filedata
	): Promise<void> {
		try {
			await videoService.validateVideoType(type)
			videoService.isFiledataExists(filedata)
			const createVideo: ICreateVideoDto = {
				name,
				link,
				type,
				userId,
			}
			videoRepository.createVideo(createVideo)
		} catch (err) {
			videoService.deleteVideoFile(link)
			throw err
		}
	}

	public async getVideo(videoId: number, userId: number): Promise<Video> {
		videoService.validateId(videoId)
		await videoService.validateIsUserCanWatch(userId, videoId)
		return await videoService.findVideo(videoId)
	}

	public async getVideoSettings(
		videoId: number,
		userId: number
	): Promise<Video> {
		await videoService.validateIsUserHavePermission(userId, videoId)
		return await videoService.findVideo(videoId)
	}

	public async deleteVideo(videoId: number, userId: number): Promise<void> {
		await videoService.validateIsUserHavePermission(userId, videoId)
		videoService.deleteVideoFile(videoId)
		videoRepository.deleteVideo(videoId)
	}

	public async updateVideo(
		videoId: number,
		name: string,
		type: string,
		userId: number
	): Promise<void> {
		const updateVideo: IUpdateVideoDto = {
			name,
			type,
		}
		await videoService.validateIsUserHavePermission(userId, videoId)
		videoRepository.updateVideo(videoId, updateVideo)
	}

	public async createPermission(
		createPermission: ICreatePermissionDto,
		userId: number
	): Promise<void> {
		await videoService.validateIsUserHavePermission(
			userId,
			createPermission.videoId
		)
		await permissionService.validateCreatePermission(createPermission)
		permissionRepository.createPermission(createPermission)
	}

	public async getVideoPermissions(
		videoId: number,
		userId: number
	): Promise<Permission[]> {
		await videoService.validateIsUserHavePermission(userId, videoId)
		return await permissionRepository.getVideoPermissions(videoId)
	}

	public async deletePermission(
		permissionId: number,
		userId: number
	): Promise<void> {
		const videoId: number = await videoService.getVideoIdByPermission(
			permissionId
		)
		await videoService.validateIsUserHavePermission(userId, videoId)
		permissionRepository.deletePermission(permissionId)
	}

	private async getVideoIdByPermission(permissionId: number): Promise<number> {
		const permission: Permission = await permissionRepository.getPermissionById(
			permissionId
		)
		return permission.video_id
	}

	private async findVideo(videoId: number): Promise<Video> {
		const video: Video = await videoRepository.getVideo(videoId)
		if (!video) {
			throw new NotFoundError(`A video with the specified ID was not found`)
		}
		return video
	}

	private async validateUpdate(
		userId: number,
		videoId: number
	): Promise<boolean> {
		const video: Video = await videoRepository.getVideo(videoId)
		return video.user_id === userId ? true : false
	}

	private async validateIsUserHavePermission(
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
		const isUserHavePermission: boolean = video.permissions.some(
			(permission) => {
				if (permission.user_id === userId && permission.type === `ADMIN`) {
					return true
				} else {
					return false
				}
			}
		)
		if (!isUserHavePermission) {
			throw new ForbiddenError(`you don't have permissions of this video`)
		}
		return
	}

	private async validateIsUserCanWatch(
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

	private async validateVideoType(type: string): Promise<void> {
		const videoTypes: string[] = [
			`READ_ALL`,
			`READ_AUTH`,
			`READ_CHOSEN`,
			`READ_ADMIN`,
		]
		if (videoTypes.includes(type)) return
		else throw new ValidationError(`incorrect video type`)
	}

	private validateId(userId: number): void {
		if (!Number.isInteger(userId)) {
			throw new ValidationError(
				`The specified user ID is invalid (e.g. not an integer)`
			)
		}
	}

	private isFiledataExists(filedata) {
		if (!filedata) {
			throw new ValidationError(`Error uploading file`)
		}
	}

	private async deleteVideoFile<T>(arg: T): Promise<void> {
		if (typeof arg === `string`) {
			const link: string = arg
			fs.unlink(`../client/static/videos/${link}`, (err) => {
				logger.error(``, err)
			})
			return
		}
		if (typeof arg === `number`) {
			const videoId: number = arg
			const video: Video = await videoRepository.getVideo(videoId)
			fs.unlink(`../client/static/videos/${video.link}`, (err) => {
				logger.error(``, err)
			})
		}
	}
}

export const videoService = new VideoService()
