import { ICreatePermissionDto } from "./dto/create-permission.dto"
import { Permission } from "./permissions.model"

class PermissionService {
	public async createPermission(createPermission: ICreatePermissionDto): Promise<void> {
		Permission.create(createPermission).save()
	}
	
	public async validateCreatePermission(createPermission: ICreatePermissionDto): Promise<boolean> {
		const permission: Permission = await Permission.findOne({
			user_id: createPermission.user_id,
			video_id: createPermission.video_id,
			type: createPermission.type
		}, {relations: [`video`]})
		if (permission) {
			return false
		}
		return true
	}

	public async deletePermission(id: number): Promise<void> {
		Permission.delete(id)
	}

	public async getVideoPermissions(videoId: number): Promise<Permission[]> {
		const permission: Permission[] = await Permission.find({ where: {video_id: videoId}})
		return permission
	}
}

export const permissionService = new PermissionService()