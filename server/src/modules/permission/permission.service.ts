import { User } from '../user/user.model'
import { ICreatePermissionDto } from '../video/dto/create-permission.dto'
import { Permission } from './permission.model'
import { permissionRepository } from './permission.repository'

class PermissionService {

	public async validateCreatePermission(
		createPermission: ICreatePermissionDto
	): Promise<boolean> {
		const permission: Permission = await permissionRepository.getPermissionByParams(createPermission)
		const user: User = await User.findOne(createPermission.userId)
		if (permission || !user) {
			return false
		}
		return true
	}
}

export const permissionService = new PermissionService()
