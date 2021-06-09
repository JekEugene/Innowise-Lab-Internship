import { DeepPartial } from 'typeorm'
import { Video } from '../video.model'

export interface ICreateVideoDto extends DeepPartial<Video> {
  name: string,
  link: string,
  userId: number,
  type: string
}