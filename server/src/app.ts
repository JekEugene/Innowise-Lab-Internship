import express, { Request, Response } from 'express'
const app = express()
import dotenv from 'dotenv'
dotenv.config()
import { createConnection } from 'typeorm'
import { connectionOptions } from './config/ormconfig'

import { swaggerUI, swaggerDocs } from './config/swagger'
import cookieParser from 'cookie-parser'
import { corsOptions, cors } from './config/cors'
app.use(cors(corsOptions))

import userController from './modules/user/user.controller'
import authController from './modules/auth/authentication.controller'
import videoController from './modules/video/video.controller'

app.use(express.static(__dirname))
app.use(express.json())
app.use(cookieParser())
const PORT = process.env.PORT || 4000

app.use(`/api-docs`, swaggerUI.serve, swaggerUI.setup(swaggerDocs))
app.use(`/users`, userController)
app.use(`/auth`, authController)
app.use(`/videos`, videoController)
app.use(`/`, (req: Request, res: Response) => {res.redirect(303, `/videos`)})

async function start() {
	await createConnection(connectionOptions)
	app.listen(PORT, () => {
		console.log(`server work`)
	})
}

start()
