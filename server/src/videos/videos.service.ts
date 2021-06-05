import { getRepository } from 'typeorm'
import { ICreatePermissionDto } from './dto/create-permission.dto'
import { ICreateVideoDto } from './dto/create-video.dto'
import { IUpdateVideoDto } from './dto/update-video.dto'
import { Permission } from './permissions.model'
import { Video } from './videos.model'

export const videoService = {
	async createVideo(newVideo: ICreateVideoDto): Promise<void> {
		Video.create(newVideo).save()
	},

	async getVideo(id: number): Promise<Video> {
		return await Video.findOne(id)
	},

	async updateVideo(id: number, updateVideo: IUpdateVideoDto): Promise<void> {
		await Video.update({ id },{ ...updateVideo })
	},
	
	async validateUpdate(videoId: number, userId: number): Promise<boolean> {
		const video: Video = await Video.findOne(videoId)
		return video.user_id === userId ? true : false
	},

	async getVideoPermissions(videoId: number): Promise<Permission[]> {
		const permission: Permission[] = await Permission.find({ where: {video_id: videoId}})
		return permission
	},
	
	async createPermission(createPermission: ICreatePermissionDto): Promise<void> {
		Permission.create(createPermission).save()
	},

	async validateCreatePermission(userId: number, createPermission: ICreatePermissionDto): Promise<boolean> {
		const permission: Permission = await Permission.findOne({
			user_id: createPermission.user_id,
			video_id: createPermission.video_id,
			type: createPermission.type
		}, {relations: [`video`]})
		if (permission || permission.video.user_id !== userId) {
			return false
		}
		return true
	},

	async deletePermission(id: number): Promise<void> {
		Permission.delete(id)
	},

	async validateDeletePermission(userId: number, videoId: number): Promise<boolean> {
		const video: Video = await getRepository(Video).findOne(videoId, {
			relations: [`permissions`]
		})
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
	
}
