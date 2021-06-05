import { ICreateVideoDto } from './dto/create-video.dto'
import { Video } from './videos.model'

export const videoService = {
	async createVideo(newVideo: ICreateVideoDto): Promise<void> {
		Video.create(newVideo).save()
	}
}