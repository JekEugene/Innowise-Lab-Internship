import { EntityAlreadyExistsError } from '../../error/EntityAlreadyExistsError'
import { ICreatePermissionDto } from './dto/create-permission.dto'
import { Permission } from './permission.model'
import { permissionRepository } from './permission.repository'

class PermissionService {
	public async validateCreatePermission(
		createPermission: ICreatePermissionDto
	): Promise<void> {
		const permission: Permission =
			await permissionRepository.getPermissionByParams(createPermission)
		if (permission) {
			throw new EntityAlreadyExistsError(`permission already exists`)
		}
		return
	}
}

export const permissionService = new PermissionService()
