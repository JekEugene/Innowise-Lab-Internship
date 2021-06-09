import express from 'express'
import dotenv from 'dotenv'
dotenv.config()
import { createConnection } from 'typeorm'
import { connectionOptions } from '../ormconfig'

import { middleware } from './middleware/middleware'

const app = express()

import userController from './modules/user/user.controller'
import homeController from './modules/home/home.controller'
import authController from './modules/auth/authentication.controller'
import videoController from './modules/video/video.controller'


const PORT = process.env.PORT || 4000

middleware(app, express)

app.use(`/`, homeController)
app.use(`/users`, userController)
app.use(`/auth`, authController)
app.use(`/videos`, videoController)

async function start() {
	await createConnection(connectionOptions)
	app.listen(PORT, () => {
		console.log(`server work`)
	})
}

start()
