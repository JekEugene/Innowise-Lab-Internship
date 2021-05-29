import express from 'express'
import { createConnection } from 'typeorm'
import cors from 'cors'

import userController from './src/users/users.controller'
import homeController from './src/home/home.controller'
import authController from './src/auth/auth.controller'
import videoController from './src/videos/videos.controller'

import dotenv from 'dotenv'
dotenv.config()

const app = express()

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

async function start() {
	await createConnection()
	app.listen(5000, () => {
		console.log(`server work`)
	})
}

start()
