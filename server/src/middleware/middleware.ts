import { Express, Request } from "express"
import multer from "multer"
import cors from 'cors'
import cookieParser from 'cookie-parser'

export function middleware(app: Express, express): void {
	app.use(express.json())

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
		destination: (req: Request, file: Express.Multer.File, cb) =>{
			cb(null, `videos`)
		},
		filename: (req: Request, file: Express.Multer.File, cb) => {
			cb(null, file.originalname)
		}
	})
	
	const fileFilter = (req: Request, file: Express.Multer.File, cb) => {
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
}