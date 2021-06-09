import { ICreatePermissionDto } from "../video/dto/create-permission.dto"
import { Permission } from "./permission.model"

class PermissionRepository {

	public async createPermission(
		createPermission: ICreatePermissionDto
	): Promise<void> {
		Permission.create({
			user_id: createPermission.userId,
			video_id: createPermission.videoId,
			type: createPermission.type,
		}).save()
	}

	public async deletePermission(permissionId: number): Promise<void> {
		Permission.delete(permissionId)
	}

	public async getVideoPermissions(videoId: number): Promise<Permission[]> {
		return await Permission.find({
			where: { video_id: videoId },
		})
	}

	public async getPermissionByParams(createPermission: ICreatePermissionDto): Promise<Permission> {
		return await Permission.findOne({
			user_id: createPermission.userId,
			video_id: createPermission.videoId,
			type: createPermission.type,
		})
	}
}

export const permissionRepository = new PermissionRepository()