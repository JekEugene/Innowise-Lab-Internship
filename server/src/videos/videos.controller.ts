import { Router, Request, Response } from 'express'
import { authService } from '../auth/authorization.service'
import { ICreatePermissionDto } from './dto/create-permission.dto'
import { ICreateVideoDto } from './dto/create-video.dto'
import { IUpdateVideoDto } from './dto/update-video.dto'
import { Permission } from './permissions.model'
import { permissionService } from './permissions.service'
import { Video } from './videos.model'
const videoController = Router()

import { videoService } from './videos.service'

/**
 * @swagger
 * /videos/newvideo:
 *   post:
 *     consumes:
 *     - application/json
 *     summary: create new video
 *     tags:
 *     - videos
 *     parameters:
 *     - in: body
 *       name: name
 *       type: string
 *       required: true
 *     - in: body
 *       name: link
 *       type: string
 *       required: true
 *     - in: body
 *       name: type
 *       type: string
 *       required: true
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Error uploading file
 */
videoController.post(`/newvideo`, authService.authUser.bind(authService), async (req: Request, res: Response) => {
	const { name, link, type } = req.body
	const user_id = res.locals.user.id
	const filedata = req.file
	if(!filedata)
		return res.status(400).send(`Error uploading file`)
	const newVideo: ICreateVideoDto = {
		name,
		link,
		type,
		user_id
	}
	videoService.createVideo(newVideo)
	return res.status(200).send(`file uploaded`)
})

/**
 * @swagger
 * /videos/{videoId}}:
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
 *       404:
 *         description: A video with the specified ID was not found
 */
videoController.get(`/:id`, authService.authUser.bind(authService), async (req: Request, res: Response) => {
	const videoid: number = +req.params.id
	const userId: number = res.locals.user?.id
	if (!Number.isInteger(videoid)) {
		return res.status(400).send(`The specified video ID is invalid (e.g. not an integer)`)
	}
	const video: Video = await videoService.getVideo(+req.params.id)
	if (!video) {
		return res.status(404).send(`A video with the specified ID was not found`)
	}
	const isUserCanWatch: boolean = await videoService.validateIsUserCanWatch(userId, videoid)
	if (!isUserCanWatch) {
		return res.status(403).send(`You don't have permission to watch this video`)
	}
	return res.status(200).json(video)
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
 */
videoController.get(`/:id/settings`, async (req: Request, res: Response) => {
	if (!res.locals.auth) {
		return res.status(401).send(`you are not logged in`)
	}
	const videoId: number = +req.params.id
	const userId: number = res.locals.user.id
	const isUserHavePermission: boolean = await videoService.validateIsUserHavePermission(userId, videoId)
	if (!isUserHavePermission) {
		return res.status(403).send(`you can't get permission of this video`)
	}
	const video: Video = await videoService.getVideo(+req.params.id)
	return res.status(200).json(video)
})

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
 *       name: name
 *       type: string
 *       required: true
 *     - in: body
 *       name: link
 *       type: string
 *       required: true
 *     - in: body
 *       name: type
 *       type: string
 *       required: true
 *     responses:
 *       200:
 *         description: Success
 *       401:
 *         description: You are not logged in
 *       403:
 *         description: You can't get permissions of this video
 */
videoController.get(`/:id/permissions`, authService.authUser.bind(authService), async (req: Request, res: Response) => {
	if (!res.locals.auth) {
		return res.status(401).send(`you are not logged in`)
	}
	const videoId: number = +req.params.id
	const userId: number = res.locals.user.id
	const isUserHavePermission: boolean = await videoService.validateIsUserHavePermission(userId, videoId)
	if (!isUserHavePermission) {
		return res.status(403).send(`you can't get permission of this video`)
	}
	const permissions: Permission[] = await permissionService.getVideoPermissions(videoId)
	return res.status(200).json(permissions)
})

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
 *       name: id
 *       type: number
 *       required: true
 *     - in: body
 *       name: name
 *       type: string
 *       required: true
 *     - in: body
 *       name: type
 *       type: string
 *       required: true
 *     responses:
 *       200:
 *         description: Success
 *       401:
 *         description: You are not logged in
 *       403:
 *         description: You don't have permission to update this video
 */
videoController.patch(`/updatevideo`, authService.authUser.bind(authService), async (req: Request, res: Response) => {
	if (!res.locals.auth) {
		return res.status(401).send(`you are not logged in`)
	}
	const { id: videoId, name, type } = req.body
	const userId: number = res.locals.user.id
	const updateVideo: IUpdateVideoDto = {
		name,
		type
	}
	const isUserHavePermission = await videoService.validateIsUserHavePermission(userId, videoId)
	if(!isUserHavePermission){
		return res.status(403).send(`you don't have permission to update this video`)
	}
	videoService.updateVideo(videoId, updateVideo)
	return res.status(200).send(`video updated`)
})

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
 *       name: id
 *       type: number
 *       required: true
 *     responses:
 *       200:
 *         description: Success
 *       401:
 *         description: You are not logged in
 *       403:
 *         description: You don't have permission to update this video
 */
videoController.delete(`/deletevideo`, authService.authUser.bind(authService), async (req: Request, res: Response) => {
	if (!res.locals.auth) {
		return res.status(401).send(`you are not logged in`)
	}
	const { id } = req.body
	const isUserHavePermission: boolean = await videoService.validateIsUserHavePermission(res.locals.user.id, id)
	if (!isUserHavePermission) {
		return res.status(403).send(`you don't have permission to delete this video`)
	}
	videoService.deleteVideo(id)
	return res.status(200).send(`video deleted`)
})

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
 *       name: id
 *       type: number
 *       required: true
 *     - in: body
 *       name: name
 *       type: string
 *       required: true
 *     - in: body
 *       name: type
 *       type: string
 *       required: true
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
videoController.post(`/createpermission`, authService.authUser.bind(authService), async (req: Request, res: Response) => {
	const userId = res.locals.id
	if (!res.locals.auth) {
		return res.status(401).send(`you are not logged in`)
	}
	const newPermission: ICreatePermissionDto = req.body

	const isUserHavePermission: boolean = await videoService.validateIsUserHavePermission(userId, newPermission.video_id)
	if (!isUserHavePermission) {
		res.status(403).send(`you don't have permissions of this video`)
	}

	const validate: boolean = await permissionService.validateCreatePermission(newPermission)
	if (!validate) {
		return res.status(422).send(`permission already exists`)
	}
	
	permissionService.createPermission(newPermission)
	return res.status(200).send(`permission created`)
})

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
 *       type: number
 *       required: true
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
videoController.delete(`/deletepermission`, authService.authUser.bind(authService), async (req: Request, res: Response) => {
	if (!res.locals.auth) {
		return res.status(401).send(`you are not logged in`)
	}
	const userId: number = res.locals.user.id
	const videoId: number = req.body.id
	const isUserHavePermission: boolean = await videoService.validateIsUserHavePermission(userId, videoId)
	if (!isUserHavePermission) {
		res.status(403).send(`you don't have permissions of this video`)
	}
	permissionService.deletePermission(videoId)
	return res.status(200).send(`permission deleted`)
})

export = videoController
