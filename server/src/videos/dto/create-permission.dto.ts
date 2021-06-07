import { DeepPartial } from 'typeorm'
import { Permission } from '../permissions.model'

export interface ICreatePermissionDto extends DeepPartial<Permission> {
  userId: number,
  videoId: number,
  type: string
}