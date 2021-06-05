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

const corsOptions = {
	origin: `http://localhost:8080`,
	methods: [`GET`, `PUT`, `POST`, `DELETE`, `OPTIONS`],
	optionsSuccessStatus: 204,
	credentials: true,
	allowedHeaders: [`Content-Type`, `Authorization`, `X-Requested-With`, `device-remember-token`, `Access-Control-Allow-Origin`, `Origin`, `Accept`]
}

app.use(cors(corsOptions))
app.use(cookieParser())

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
