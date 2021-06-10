import { Router, Request, Response } from 'express'
import { ICreatePermissionDto } from './dto/create-permission.dto'
import { ICreateVideoDto } from './dto/create-video.dto'
import { IUpdateVideoDto } from './dto/update-video.dto'
import { Permission } from '../permission/permission.model'
import { permissionService } from '../permission/permission.service'
import { Video } from './video.model'
const videoController = Router()
import { videoService } from './video.service'
import { logger } from '../../middleware/logger'
import { authUser } from '../../middleware/auth'

/**
 * @swagger
 * /videos:
 *   get:
 *     summary: Get all videos, which you can watch
 *     tags:
 *     - videos
 *     parameters:
 *     responses:
 *       200:
 *         description: Success
 */
videoController.get(
	`/`,
	authUser,
	async (req: Request, res: Response) => {
		try {
			const userId: number = res.locals.user?.id
			const videos: Video[] = await videoService.getAllVideos(
				res.locals.auth,
				userId
			)
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
	}
)

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
 */
videoController.post(
	`/newvideo`,
	authUser,
	async (req: Request, res: Response) => {
		const { name, link, type } = req.body
		const userId: number = res.locals.user.id
		const validateVideoType: boolean = await videoService.validateVideoType(
			type
		)
		if (!validateVideoType) {
			videoService.deleteVideoFile(link)
			return res.status(400).send(`incorrect video type`)
		}
		const filedata = req.file
		if (!filedata) {
			videoService.deleteVideoFile(link)
			return res.status(400).send(`Error uploading file`)
		}
		const newVideo: ICreateVideoDto = {
			name,
			link,
			type,
			userId,
		}
		videoService.createVideo(newVideo)
		return res.status(200).send(`file uploaded`)
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
 *       404:
 *         description: A video with the specified ID was not found
 *       403:
 *         description: You don't have permission to watch this video
 */
videoController.get(
	`/:id`,
	authUser,
	async (req: Request, res: Response) => {
		const videoId: number = +req.params.id
		const userId: number = res.locals.user?.id
		if (!Number.isInteger(videoId)) {
			return res
				.status(400)
				.send(`The specified video ID is invalid (e.g. not an integer)`)
		}
		const video: Video = await videoService.getVideo(videoId)
		if (!video) {
			return res.status(404).send(`A video with the specified ID was not found`)
		}
		const isUserCanWatch: boolean = await videoService.validateIsUserCanWatch(
			userId,
			videoId
		)
		if (!isUserCanWatch) {
			return res
				.status(403)
				.send(`You don't have permission to watch this video`)
		}
		return res.status(200).json(video)
	}
)

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
 */
videoController.get(
	`/:id/settings`,
	authUser,
	async (req: Request, res: Response) => {
		if (!res.locals.auth) {
			return res.status(401).send(`you are not logged in`)
		}
		const videoId: number = +req.params.id
		const userId: number = res.locals.user.id
		const isUserHavePermission: boolean =
			await videoService.validateIsUserHavePermission(userId, videoId)
		if (!isUserHavePermission) {
			return res.status(403).send(`you can't get permission of this video`)
		}
		const video: Video = await videoService.getVideo(videoId)
		if (!video) {
			return res.status(404).send(`A video with the specified ID was not found`)
		}
		return res.status(200).json(video)
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
 *     - in: body
 *       name: video
 *       schema:
 *         type: object
 *         required:
 *         - name
 *         - link
 *         - type
 *         properties:
 *           name:
 *             type: string
 *           link:
 *             type: string
 *           type:
 *             type: string
 *     responses:
 *       200:
 *         description: Success
 *       401:
 *         description: You are not logged in
 *       403:
 *         description: You can't get permissions of this video
 */
videoController.get(
	`/:id/permissions`,
	authUser,
	async (req: Request, res: Response) => {
		if (!res.locals.auth) {
			return res.status(401).send(`you are not logged in`)
		}
		const videoId: number = +req.params.id
		const userId: number = res.locals.user.id
		const isUserHavePermission: boolean =
			await videoService.validateIsUserHavePermission(userId, videoId)
		if (!isUserHavePermission) {
			return res.status(403).send(`you can't get permission of this video`)
		}
		const permissions: Permission[] = await videoService.getVideoPermissions(
			videoId
		)
		return res.status(200).json(permissions)
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
 *         - name
 *         - link
 *         - type
 *         properties:
 *           name:
 *             type: string
 *           link:
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
 */
videoController.patch(
	`/updatevideo`,
	authUser,
	async (req: Request, res: Response) => {
		if (!res.locals.auth) {
			return res.status(401).send(`you are not logged in`)
		}
		const { id: videoId, name, type } = req.body
		const userId: number = res.locals.user.id
		const updateVideo: IUpdateVideoDto = {
			name,
			type,
		}
		const isUserHavePermission =
			await videoService.validateIsUserHavePermission(userId, videoId)
		if (!isUserHavePermission) {
			return res
				.status(403)
				.send(`you don't have permission to update this video`)
		}
		videoService.updateVideo(videoId, updateVideo)
		return res.status(200).send(`video updated`)
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
 */
videoController.delete(
	`/deletevideo`,
	authUser,
	async (req: Request, res: Response) => {
		if (!res.locals.auth) {
			return res.status(401).send(`you are not logged in`)
		}
		const videoId: number = req.body.id
		const userId: number = res.locals.user.id
		const isUserHavePermission: boolean =
			await videoService.validateIsUserHavePermission(userId, videoId)
		if (!isUserHavePermission) {
			return res
				.status(403)
				.send(`you don't have permission to delete this video`)
		}
		videoService.deleteVideoFile(videoId)
		videoService.deleteVideo(videoId)
		return res.status(200).send(`video deleted`)
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
 *       422:
 *         description: permission already exists
 */
videoController.post(
	`/createpermission`,
	authUser,
	async (req: Request, res: Response) => {
		if (!res.locals.auth) {
			return res.status(401).send(`you are not logged in`)
		}
		const userId: number = res.locals.user.id
		const createPermission: ICreatePermissionDto = req.body

		const isUserHavePermission: boolean =
			await videoService.validateIsUserHavePermission(
				userId,
				createPermission.videoId
			)
		if (!isUserHavePermission) {
			return res.status(403).send(`you don't have permissions of this video`)
		}

		const validate: boolean = await permissionService.validateCreatePermission(
			createPermission
		)
		if (!validate) {
			return res.status(422).send(`permission already exists`)
		}

		videoService.createPermission(createPermission)
		return res.status(200).send(`permission created`)
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
 *         description: You don't have permission of this video
 *       422:
 *         description: permission already exists
 */
videoController.delete(
	`/deletepermission`,
	authUser,
	async (req: Request, res: Response) => {
		if (!res.locals.auth) {
			return res.status(401).send(`you are not logged in`)
		}
		const userId: number = res.locals.user.id
		const videoId: number = req.body.id
		const isUserHavePermission: boolean =
			await videoService.validateIsUserHavePermission(userId, videoId)
		if (!isUserHavePermission) {
			res.status(403).send(`you don't have permissions of this video`)
		}
		videoService.deletePermission(videoId)
		return res.status(200).send(`permission deleted`)
	}
)

export = videoController
