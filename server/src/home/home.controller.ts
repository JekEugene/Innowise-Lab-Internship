import { Router, Request, Response  } from "express"
import { authService } from "../auth/authorization.service"
const homeController = Router()

import { homeService } from './home.service'

homeController.get(`/`, authService.authUser, async (req: Request, res: Response) => {
	const videos = await homeService.getVideos(res.locals.auth, res.locals.user?.id)
	const sendVideos = videos.map(video => {
		return { name: video.name, link: video.link, user_id: video.user_id }
	})
	res.status(200).json(sendVideos)
})

export = homeController
