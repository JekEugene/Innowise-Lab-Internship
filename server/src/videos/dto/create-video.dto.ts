import { DeepPartial } from 'typeorm'
import { Video } from '../videos.model'

export interface ICreateVideoDto extends DeepPartial<Video> {
  name: string,
  link: string,
  userId: number,
  type: string
}