import { Router, Request, Response } from 'express'
import { authService } from '../auth/authorization.service'
import { Video } from '../videos/videos.model'
import { User } from './users.model'
const userController = Router()

import { userService } from './users.service'

/**
 * @swagger
 * /users/:
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
	res.status(200).json(sendUsers)
})

/**
 * @swagger
 * /users/{userid}:
 *   get:
 *     summary: Get all user videos, which you can watch
 *     tags:
 *     - users
 *     parameters:
 *     - in: path
 *       name: userId
 *       type: integer
 *       required: true
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
 *       400:
 *         description: The specified user ID is invalid (e.g. not an integer)
 *       404:
 *         description: A user with the specified ID was not found
 */
userController.get(`/:id`, authService.authUser.bind(authService), async (req: Request, res: Response) => {
	const id: number = +req.params.id
	if (!Number.isInteger(id)) {
		return res.status(400).send(`The specified user ID is invalid (e.g. not an integer)`)
	}
	const isUserExist: boolean = await userService.isUserExist(id)
	if (!isUserExist) {
		return res.status(404).send(`A user with the specified ID was not found`)
	}
	const videos: Video[] = await userService.getUserVideos(res.locals.auth, res.locals.user?.id, +req.params.id)
	const sendVideos = videos.map(video => {
		return { id: video.id, name: video.name, link: video.link, user_id: video.user_id }
	})
	res.status(200).json(sendVideos)
})

export = userController
