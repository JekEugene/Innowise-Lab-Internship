import { Router, Request, Response } from "express"
import { authService } from "../auth/authorization.service"
import { Video } from "../videos/videos.model"
import { User } from "./users.model"
const userController = Router()

import { userService } from './users.service'


userController.get(`/`, async (req: Request, res: Response) => {
	const users: User[] = await userService.getAllUsers()
	const sendUsers = users.map(user => {
		return {id: user.id, login: user.login}
	})
	res.status(200).json(sendUsers)
})

userController.get(`/:id`, authService.authUser, async (req: Request, res: Response) => {
	const videos: Video[] = await userService.getUserVideos(res.locals.auth, res.locals.user?.id, +req.params.id)
	const sendVideos = videos.map(video => {
		return { name: video.name, link: video.link, user_id: video.user_id }
	})
	res.status(200).json(sendVideos)
})

userController.post(`/newvideo`, async (req: Request, res: Response) => {
	
})

export = userController
