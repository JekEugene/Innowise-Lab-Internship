import { ICreatePermissionDto } from './dto/create-permission.dto'
import { Permission } from './permissions.model'

class PermissionService {
	public async createPermission(
		createPermission: ICreatePermissionDto
	): Promise<void> {
		Permission.create(createPermission).save()
	}

	public async validateCreatePermission(
		createPermission: ICreatePermissionDto
	): Promise<boolean> {
		const permission: Permission = await Permission.findOne(
			{ ...createPermission },
			{ relations: [`video`] }
		)
		if (permission) {
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
