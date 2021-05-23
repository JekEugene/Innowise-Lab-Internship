import express from 'express'
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

async function start() {
	app.listen(5000, () => {
		console.log(`server work`)
	})
}

start()
