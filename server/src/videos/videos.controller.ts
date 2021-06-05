import { Router, Request, Response } from "express"
const videoController = Router()

import { videoService } from './videos.service'

// videoController.post(`/newvideo`, async (req: Request, res: Response) => {
// 	console.log(`here`)
// 	const filedata = req.file
// 	console.log(req.file)
// 	if(!filedata)
// 		return res.status(400).send(`Ошибка при загрузке файла`)
// 	return res.status(200).send(`файл загружен`)
// })

export = videoController
