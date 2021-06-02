import express from 'express'
import { createConnection } from 'typeorm'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express()
app.use(express.json())

import userController from './src/users/users.controller'
import homeController from './src/home/home.controller'
import authController from './src/auth/authentication.controller'
import videoController from './src/videos/videos.controller'

import dotenv from 'dotenv'
dotenv.config()

const PORT = process.env.PORT || 4000

app.use(`/`, homeController)
app.use(`/user`, userController)
app.use(`/auth`, authController)
app.use(`/video`, videoController)

const options: cors.CorsOptions = {
	allowedHeaders: [
		`Origin`,
		`X-Requested-With`,
		`Content-Type`,
		`Accept`,
	],
	credentials: true,
	methods: `GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE`,
	preflightContinue: false,
}

app.use(cors(options))
app.use(cookieParser())


async function start() {
	await createConnection()
	app.listen(PORT, () => {
		console.log(`server work`)
	})
}

start()
