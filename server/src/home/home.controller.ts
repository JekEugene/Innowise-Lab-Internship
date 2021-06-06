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
 *     - in: cookie
 *       name: accessToken
 *       type: string
 *       required: false
 *     - in: cookie
 *       name: refreshToken
 *       type: string
 *       required: false
 *     responses:
 *       200:
 *         description: Success
 */
homeController.get(`/`, authService.authUser.bind(authService), async (req: Request, res: Response) => {
	const videos = await homeService.getVideos(res.locals.auth, res.locals.user?.id)
	const sendVideos = videos.map(video => {
		return { id: video.id, name: video.name, link: video.link, user_id: video.user_id }
	})
	res.status(200).json(sendVideos)
})

export = homeController
