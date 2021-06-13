import { Router, Request, Response } from 'express'
import { ICreatePermissionDto } from '../permission/dto/create-permission.dto'
import { Permission } from '../permission/permission.model'
import { Video } from './video.model'
const videoController = Router()
import { videoService } from './video.service'
import { authUser } from '../../middleware/auth-user'
import multer from 'multer'
import { fileFilter, storageConfig } from '../../config/multer'
import { logger } from '../../config/logger'
import { isAuth } from '../../middleware/is-auth'
import { AppError } from '../../error/AppError'

/**
 * @swagger
 * /videos:
 *   get:
 *     summary: Get all videos, which you can watch
 *     tags:
 *     - videos
 *     responses:
 *       200:
 *         description: Success
 */
videoController.get(`/`, authUser, async (req: Request, res: Response) => {
	try {
		const userId: number = res.locals.user?.id
		const isAuth: boolean = res.locals.auth

		const videos: Video[] = await videoService.getAllVideos(isAuth, userId)
		const sendVideos = videos.map((video) => {
			return {
				id: video.id,
				name: video.name,
				link: video.link,
				user_id: video.user_id,
			}
		})
		return res.status(200).json(sendVideos)
	} catch (err) {
		logger.error(``, err)
	}
})

/**
 * @swagger
 * /videos/newvideo:
 *   post:
 *     summary: create new video
 *     tags:
 *     - videos
 *     consumes:
 *     - multipart/form-data
 *     parameters:
 *     - in: formData
 *       name: name
 *       type: string
 *       required: true
 *     - in: formData
 *       name: type
 *       type: string
 *       required: true
 *     - in: formData
 *       name: filedata
 *       type: file
 *       required: true
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Validate error
 *       401:
 *         description: You are not logged in
 */
videoController.post(
	`/newvideo`,
	authUser,
	isAuth,
	multer({ storage: storageConfig, fileFilter: fileFilter }).single(`filedata`),
	async (req: Request, res: Response) => {
		try {
			const { name, link, type } = req.body
			const userId: number = res.locals.user.id
			const filedata = req.file

			await videoService.newVideo(name, link, type, userId, filedata)
			return res.status(200).send(`file uploaded`)
		} catch (err) {
			logger.error(``, err)
			if (err instanceof AppError) {
				return res.status(err.statusCode).send(err.message)
			}
			return res.status(400).send(`unknown error`)
		}
	}
)

/**
 * @swagger
 * /videos/{videoId}:
 *   get:
 *     summary: get video
 *     tags:
 *     - videos
 *     parameters:
 *     - in: path
 *       name: videoId
 *       type: string
 *       required: true
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: The specified video ID is invalid (e.g. not an integer)
 *       403:
 *         description: You don't have permission to watch this video
 *       404:
 *         description: A video with the specified ID was not found
 */
videoController.get(`/:id`, authUser, async (req: Request, res: Response) => {
	try {
		const videoId: number = +req.params.id
		const userId: number = res.locals.user?.id

		const video: Video = await videoService.getVideo(videoId, userId)
		return res.status(200).json(video)
	} catch (err) {
		logger.error(``, err)
		if (err instanceof AppError) {
			return res.status(err.statusCode).send(err.message)
		}
		return res.status(400).send(`unknown error`)
	}
})

/**
 * @swagger
 * /videos/{videoId}/settings:
 *   get:
 *     summary: get video settings
 *     tags:
 *     - videos
 *     parameters:
 *     - in: path
 *       name: videoId
 *       type: string
 *       required: true
 *     responses:
 *       200:
 *         description: Success
 *       401:
 *         description: You are not logged in
 *       403:
 *         description: You can't get permission of this video
 *       404:
 *         description: A video with the specified ID was not found
 */
videoController.get(
	`/:id/settings`,
	authUser,
	isAuth,
	async (req: Request, res: Response) => {
		try {
			const videoId: number = +req.params.id
			const userId: number = res.locals.user.id

			const video: Video = await videoService.getVideoSettings(videoId, userId)
			return res.status(200).json(video)
		} catch (err) {
			logger.error(``, err)
			if (err instanceof AppError) {
				return res.status(err.statusCode).send(err.message)
			}
			return res.status(400).send(`unknown error`)
		}
	}
)

/**
 * @swagger
 * /videos/{videoId}/permissions:
 *   get:
 *     consumes:
 *     - application/json
 *     summary: create new video
 *     tags:
 *     - videos
 *     parameters:
 *     - in: path
 *       name: videoId
 *       type: string
 *       required: true
 *     responses:
 *       200:
 *         description: Success
 *       401:
 *         description: You are not logged in
 *       403:
 *         description: You can't get permissions of this video
 *       404:
 *         description: A video with the specified ID was not found
 */
videoController.get(
	`/:id/permissions`,
	authUser,
	isAuth,
	async (req: Request, res: Response) => {
		try {
			const videoId: number = +req.params.id
			const userId: number = res.locals.user.id

			const permissions: Permission[] = await videoService.getVideoPermissions(
				videoId,
				userId
			)
			return res.status(200).json(permissions)
		} catch (err) {
			logger.error(``, err)
			if (err instanceof AppError) {
				return res.status(err.statusCode).send(err.message)
			}
			return res.status(400).send(`unknown error`)
		}
	}
)

/**
 * @swagger
 * /videos/updatevideo:
 *   patch:
 *     consumes:
 *     - application/json
 *     summary: create new video
 *     tags:
 *     - videos
 *     parameters:
 *     - in: body
 *       name: video update
 *       schema:
 *         type: object
 *         required:
 *         - id
 *         - name
 *         - type
 *         properties:
 *           videoId:
 *             type: number
 *           name:
 *             type: string
 *           type:
 *             type: string
 *     responses:
 *       200:
 *         description: Success
 *       401:
 *         description: You are not logged in
 *       403:
 *         description: You don't have permission to update this video
 *       404:
 *         description: A video with the specified ID was not found
 */
videoController.patch(
	`/updatevideo`,
	authUser,
	isAuth,
	async (req: Request, res: Response) => {
		try {
			const { videoId, name, type } = req.body
			const userId: number = res.locals.user.id

			await videoService.updateVideo(videoId, name, type, userId)
			return res.status(200).send(`video updated`)
		} catch (err) {
			logger.error(``, err)
			if (err instanceof AppError) {
				return res.status(err.statusCode).send(err.message)
			}
			return res.status(400).send(`unknown error`)
		}
	}
)

/**
 * @swagger
 * /videos/deletevideo:
 *   delete:
 *     consumes:
 *     - application/json
 *     summary: create new video
 *     tags:
 *     - videos
 *     parameters:
 *     - in: body
 *       name: video id
 *       schema:
 *         type: object
 *         required:
 *         - id
 *         properties:
 *           id:
 *             type: number
 *     responses:
 *       200:
 *         description: Success
 *       401:
 *         description: You are not logged in
 *       403:
 *         description: You don't have permission to update this video
 *       404:
 *         description: A video with the specified ID was not found
 */
videoController.delete(
	`/deletevideo`,
	authUser,
	isAuth,
	async (req: Request, res: Response) => {
		try {
			const videoId: number = req.body.id
			const userId: number = res.locals.user.id

			await videoService.deleteVideo(videoId, userId)
			return res.status(200).send(`video deleted`)
		} catch (err) {
			logger.error(``, err)
			if (err instanceof AppError) {
				return res.status(err.statusCode).send(err.message)
			}
			return res.status(400).send(`unknown error`)
		}
	}
)

/**
 * @swagger
 * /videos/createpermission:
 *   post:
 *     consumes:
 *     - application/json
 *     summary: create new permission
 *     tags:
 *     - videos
 *     parameters:
 *     - in: body
 *       name: permission
 *       schema:
 *         type: object
 *         required:
 *         - userId
 *         - videoId
 *         - type
 *         properties:
 *           userId:
 *             type: number
 *           videoId:
 *             type: number
 *           type:
 *             type: string
 *     responses:
 *       200:
 *         description: Success
 *       401:
 *         description: You are not logged in
 *       403:
 *         description: You don't have permission of this video
 *       404:
 *         description: A video with the specified ID was not found
 *       422:
 *         description: permission already exists
 */
videoController.post(
	`/createpermission`,
	authUser,
	isAuth,
	async (req: Request, res: Response) => {
		try {
			const userId: number = res.locals.user.id
			const createPermission: ICreatePermissionDto = req.body

			await videoService.createPermission(createPermission, userId)
			return res.status(200).send(`permission created`)
		} catch (err) {
			logger.error(``, err)
			if (err instanceof AppError) {
				return res.status(err.statusCode).send(err.message)
			}
			return res.status(400).send(`unknown error`)
		}
	}
)

/**
 * @swagger
 * /videos/deletepermission:
 *   delete:
 *     consumes:
 *     - application/json
 *     summary: create new permission
 *     tags:
 *     - videos
 *     parameters:
 *     - in: body
 *       name: id
 *       schema:
 *         type: object
 *         required:
 *         - id
 *         properties:
 *           id:
 *             type: number
 *     responses:
 *       200:
 *         description: Success
 *       401:
 *         description: You are not logged in
 *       403:
 *         description: You don't have permission of this video
 *       404:
 *         description: A video with the specified ID was not found
 *       422:
 *         description: permission already exists
 */
videoController.delete(
	`/deletepermission`,
	authUser,
	isAuth,
	async (req: Request, res: Response) => {
		try {
			const userId: number = res.locals.user.id
			const permissionId: number = req.body.id

			await videoService.deletePermission(permissionId, userId)
			return res.status(200).send(`permission deleted`)
		} catch (err) {
			logger.error(``, err)
			if (err instanceof AppError) {
				return res.status(err.statusCode).send(err.message)
			}
			return res.status(400).send(`unknown error`)
		}
	}
)

export = videoController
