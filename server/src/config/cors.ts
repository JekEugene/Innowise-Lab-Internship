export { default as cors } from 'cors'

export const corsOptions = {
	origin: `http://localhost:8080`,
	methods: [`GET`, `PUT`, `POST`, `PATCH`, `DELETE`, `OPTIONS`],
	optionsSuccessStatus: 204,
	credentials: true,
	allowedHeaders: [`Content-Type`, `Authorization`, `X-Requested-With`, `Access-Control-Allow-Origin`, `Origin`, `Accept`]
}