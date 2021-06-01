import { DeepPartial } from "typeorm"
import { User } from "../users.model"
export interface ICreateUserDto extends DeepPartial<User> {
  name: string
  password: string
}