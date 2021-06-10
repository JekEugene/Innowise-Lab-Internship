import multer from 'multer'
import { Express, Request } from 'express'
import path from 'path'

export const storageConfig = multer.diskStorage({
	destination: (req: Request, file: Express.Multer.File, cb) => {
		cb(null, `../client/static/videos`)
	},
	filename: (req: Request, file: Express.Multer.File, cb) => {
		req.body.link = `VIDEO-` + Date.now() + path.extname(file.originalname)
		cb(null, req.body.link)
	},
})

export const fileFilter = (req: Request, file: Express.Multer.File, cb): void => {
	console.log(`hi`)
	const videoTypes = [
		`video/mpeg`,
		`video/mp4`,
		`video/ogg`,
		`video/quicktime`,
		`video/webm`,
		`video/x-ms-wmv`,
		`video/x-flv`,
		`video/x-msvideo`,
		`video/3gpp`,
		`video/3gpp2`,
	]
	if (videoTypes.includes(file.mimetype)) {
		cb(null, true)
	} else {
		cb(null, false)
	}
}