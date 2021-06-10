import { Express, Request } from 'express'
import multer from 'multer'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import path from 'path'
import swaggerJsDoc from 'swagger-jsdoc'
import swaggerUI from 'swagger-ui-express'

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function middleware(app: Express, express): void {
	app.use(express.json())

	const corsOptions = {
		origin: `http://localhost:8080`,
		methods: [`GET`, `PUT`, `POST`, `PATCH`, `DELETE`, `OPTIONS`],
		optionsSuccessStatus: 204,
		credentials: true,
		allowedHeaders: [`Content-Type`, `Authorization`, `X-Requested-With`, `Access-Control-Allow-Origin`, `Origin`, `Accept`]
	}
	app.use(cors(corsOptions))
	
	app.use(cookieParser())

	const storageConfig = multer.diskStorage({
		destination: (req: Request, file: Express.Multer.File, cb) =>{
			cb(null, `../client/static/videos`)
		},
		filename: (req: Request, file: Express.Multer.File, cb) => {
			req.body.link = `VIDEO-` + Date.now() + path.extname(file.originalname)
			cb(null, req.body.link)
		}
	})
	
	const fileFilter = (req: Request, file: Express.Multer.File, cb) => {
		console.log(`hi`)
		const videoTypes = [`video/mpeg`, `video/mp4`, `video/ogg`, `video/quicktime`,
			`video/webm`, `video/x-ms-wmv`, `video/x-flv`, `video/x-msvideo`, `video/3gpp`, `video/3gpp2`]
		if(videoTypes.includes(file.mimetype)){
			cb(null, true)
		}
		else{
			cb(null, false)
		}
	}
	
	app.use(express.static(__dirname))
	
	app.use(multer({ storage: storageConfig, fileFilter: fileFilter }).single(`filedata`))
	
	const swaggerOptions = {
		swaggerDefinition: {
			info: {
				title: `Video Gallery API`,
				version: `1.0.1`,
			},
		},
		apis: [`./src/modules/video/video.controller.ts`, `./src/modules/auth/authentication.controller.ts`,
			`./src/modules/user/user.controller.ts`,
		],
	}
	
	const swaggerDocs = swaggerJsDoc(swaggerOptions)
	app.use(`/api-docs`, swaggerUI.serve, swaggerUI.setup(swaggerDocs))
}