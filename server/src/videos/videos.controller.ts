import { Router, Request, Response } from "express"
import { authService } from "../auth/authorization.service"
import { ICreateVideoDto } from "./dto/create-video.dto"
const videoController = Router()

import { videoService } from './videos.service'

videoController.post(`/newvideo`, authService.authUser, async (req: Request, res: Response) => {
	console.log(`here`)
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


export = videoController
