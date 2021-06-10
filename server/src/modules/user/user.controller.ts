import { Router, Request, Response } from 'express'
import { logger } from '../../config/logger'
import { AppError } from '../../error/AppError'
import { authUser } from '../../middleware/auth'
import { Video } from '../video/video.model'
import { User } from './user.model'
const userController = Router()

import { userService } from './user.service'

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     tags:
 *     - users
 *     responses:
 *       200:
 *         description: Success
 */
userController.get(`/`, async (req: Request, res: Response) => {
	const users: User[] = await userService.getAllUsers()
	const sendUsers = users.map(user => {
		return {id: user.id, login: user.login}
	})
	return res.status(200).json(sendUsers)
})

/**
 * @swagger
 * /users/{userId}:
 *   get:
 *     summary: Get all user videos, which you can watch
 *     tags:
 *     - users
 *     parameters:
 *     - in: path
 *       name: userId
 *       type: integer
 *       required: true
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: The specified user ID is invalid (e.g. not an integer)
 *       404:
 *         description: A user with the specified ID was not found
 */
userController.get(`/:id`, authUser, async (req: Request, res: Response) => {
	try {
		const reqUserId: number = +req.params.id
		const userId: number = res.locals.user?.id
		userService.validateId(reqUserId)
		await userService.isUserExist(reqUserId)
		const videos: Video[] = await userService.getAllUserVideos(res.locals.auth, userId, reqUserId)
		const sendVideos = videos.map(video => {
			return { id: video.id, name: video.name, link: video.link, user_id: video.user_id }
		})
		return res.status(200).json(sendVideos)
	} catch (err) {
		logger.error(``, err)
		if (err instanceof AppError) {
			return res.status(err.statusCode).send(err.message)
		}
		return res.status(400).send(`unknown error`)
	}
	
})

export = userController
