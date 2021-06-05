import { Router, Request, Response } from 'express'
import { authService } from '../auth/authorization.service'
import { ICreatePermissionDto } from './dto/create-permission.dto'
import { ICreateVideoDto } from './dto/create-video.dto'
import { IUpdateVideoDto } from './dto/update-video.dto'
import { Permission } from './permissions.model'
import { Video } from './videos.model'
const videoController = Router()

import { videoService } from './videos.service'

videoController.post(`/newvideo`, authService.authUser, async (req: Request, res: Response) => {
	const filedata = req.file
	if(!filedata)
		return res.status(400).send(`Error uploading file`)
	const newVideo: ICreateVideoDto = {
		name: req.body.name,
		link: req.body.link,
		type: req.body.type,
		user_id: res.locals.user.id
	}
	videoService.createVideo(newVideo)
	return res.status(200).send(`file uploaded`)
})

videoController.get(`/:id`, async (req: Request, res: Response) => {
	const video: Video = await videoService.getVideo(+req.params.id)
	res.status(200).json(video)
})

videoController.get(`/:id/settings`, async (req: Request, res: Response) => {
	const video: Video = await videoService.getVideo(+req.params.id)
	res.status(200).json(video)
})

videoController.get(`/:id/permissions`, async (req: Request, res: Response) => {
	const permissions: Permission[] = await videoService.getVideoPermissions(+req.params.id)
	res.status(200).json(permissions)
})

videoController.patch(`/updatevideo`, authService.authUser, async (req: Request, res: Response) => {
	if (!res.locals.auth) {
		return res.status(401).send(`you are not logged in`)
	}
	const updateVideo: IUpdateVideoDto = {
		name: req.body.name,
		type: req.body.type
	}
	const validate = await videoService.validateUpdate(req.body.id, res.locals.user.id)
	if(!validate){
		return res.status(401).send(`validate error`)
	}
	videoService.updateVideo(req.body.id, updateVideo)
	return res.status(200).send(`video updated`)
})

videoController.post(`/createpermission`, authService.authUser, async (req: Request, res: Response) => {
	if (!res.locals.auth) {
		return res.status(401).send(`you are not logged in`)
	}
	const newPermission: ICreatePermissionDto = req.body
	const validate: boolean = await videoService.validateCreatePermission(res.locals.id, newPermission)
	if (!validate) {
		return res.status(401).send(`validate error`)
	}
	videoService.createPermission(newPermission)
	return res.status(200).send(`permission created`)
})

videoController.delete(`/deletepermission`, authService.authUser, async (req: Request, res: Response) => {
	if (!res.locals.auth) {
		return res.status(401).send(`you are not logged in`)
	}
	const validate: boolean = await videoService.validateDeletePermission(res.locals.user.id, req.body.id)
	if (!validate) {
		return res.status(401).send(`validate error`)
	}
	videoService.deletePermission(req.body.id)
	return res.status(200).send(`permission deleted`)
})

export = videoController
