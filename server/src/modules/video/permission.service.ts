import { User } from '../user/user.model'
import { ICreatePermissionDto } from './dto/create-permission.dto'
import { Permission } from './permission.model'

class PermissionService {
	public async createPermission(
		createPermission: ICreatePermissionDto
	): Promise<void> {
		Permission.create({
			user_id: createPermission.userId,
			video_id: createPermission.videoId,
			type: createPermission.type,
		}).save()
	}

	public async validateCreatePermission(
		createPermission: ICreatePermissionDto
	): Promise<boolean> {
		const permission: Permission = await Permission.findOne(
			{
				user_id: createPermission.userId,
				video_id: createPermission.videoId,
				type: createPermission.type,
			},
			{ relations: [`video`] }
		)
		const user: User = await User.findOne(createPermission.userId)
		if (permission || !user) {
			return false
		}
		return true
	}

	public async deletePermission(id: number): Promise<void> {
		Permission.delete(id)
	}

	public async getVideoPermissions(videoId: number): Promise<Permission[]> {
		const permission: Permission[] = await Permission.find({
			where: { video_id: videoId },
		})
		return permission
	}
}

export const permissionService = new PermissionService()
