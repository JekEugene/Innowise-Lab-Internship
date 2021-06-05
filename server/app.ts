import express, { Request, Response} from 'express'
import { createConnection } from 'typeorm'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import multer from 'multer'
import path from 'path'

const app = express()
app.use(express.json())

import userController from './src/users/users.controller'
import homeController from './src/home/home.controller'
import authController from './src/auth/authentication.controller'
import videoController from './src/videos/videos.controller'

import dotenv from 'dotenv'
dotenv.config()

const PORT = process.env.PORT || 4000

const corsOptions = {
	origin: `http://localhost:8080`,
	methods: [`GET`, `PUT`, `POST`, `DELETE`, `OPTIONS`],
	optionsSuccessStatus: 204,
	credentials: true,
	allowedHeaders: [`Content-Type`, `Authorization`, `X-Requested-With`, `device-remember-token`, `Access-Control-Allow-Origin`, `Origin`, `Accept`]
}

app.use(cors(corsOptions))
app.use(cookieParser())

const storageConfig = multer.diskStorage({
	destination: (req, file, cb) =>{
		cb(null, `videos`)
	},
	filename: (req, file, cb) =>{
		cb(null, file.originalname)
	}
})

const fileFilter = (req, file, cb) => {
	console.log(`filter`)
	if(file.mimetype === `video/mp4`){
		cb(null, true)
	}
	else{
		cb(null, false)
	}
}

app.use(express.static(__dirname))

app.use(multer({storage:storageConfig, fileFilter: fileFilter}).single(`filedata`))
app.post(`/videos/newvideo`, async (req: Request, res: Response) => {
	console.log(`here`)
	const filedata = req.file
	console.log(req.file)
	if(!filedata)
		return res.status(400).send(`Ошибка при загрузке файла`)
	return res.status(200).send(`файл загружен`)
})

app.use(`/`, homeController)
app.use(`/users`, userController)
app.use(`/auth`, authController)
app.use(`/videos`, videoController)


async function start() {
	await createConnection()
	app.listen(PORT, () => {
		console.log(`server work`)
	})
}

start()
