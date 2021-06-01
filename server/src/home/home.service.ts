import { Request, Response } from 'express'
//import { Permission } from '../videos/permissions.model'
import { Video } from '../videos/videos.model'

export const homeService = {
	async homePage(req: Request, res: Response): Promise<void> {
		if(res.locals.auth === true){
			const videos = await Video.find({
				where: [
					{ type: `READ_ALL` },
					{ type: `READ_AUTH` },
				],
			})
			const sendVideos = videos.map(video => {
				return { name: video.name, link: video.link}
			})
			
			res.cookie(`id`, res.locals.user.id)
			res.cookie(`login`, res.locals.user.login)
			res.cookie(`auth`, res.locals.auth)

			res.status(200).json(sendVideos)
		} else {
			const videos = await Video.find({
				where: [
					{ type: `READ_ALL` },
				],
			})
			const sendVideos = videos.map(video => {
				return { name: video.name, link: video.link}
			})

			res.cookie(`auth`, res.locals.auth)
			res.status(200).json(sendVideos)
		}
	}
}
