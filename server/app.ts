import express from 'express'
import { createConnection } from 'typeorm'
import { middleware } from './src/middleware/middleware'

const app = express()

import userController from './src/users/users.controller'
import homeController from './src/home/home.controller'
import authController from './src/auth/authentication.controller'
import videoController from './src/videos/videos.controller'

import dotenv from 'dotenv'
dotenv.config()

const PORT = process.env.PORT || 4000

middleware(app, express)

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
