import { Router, Request, Response  } from 'express'
import { authService } from '../auth/authorization.service'
const homeController = Router()

import { homeService } from './home.service'


/**
 * @swagger
 * /:
 *   get:
 *     summary: Get all videos, which you can watch
 *     tags:
 *     - home
 *     parameters:
 *     responses:
 *       200:
 *         description: Success
 */
homeController.get(`/`, authService.authUser.bind(authService), async (req: Request, res: Response) => {
	const userId: number = res.locals.user?.id
	const videos = await homeService.getVideos(res.locals.auth, userId)
	const sendVideos = videos.map(video => {
		return { id: video.id, name: video.name, link: video.link, user_id: video.user_id }
	})
	res.status(200).json(sendVideos)
})

export = homeController
