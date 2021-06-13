import { ConnectionOptions } from 'typeorm'

export const connectionOptions: ConnectionOptions = {
	type: `postgres`,
	host: process.env.HOST || `localhost`,
	port: +process.env.DB_PORT || 5432,
	username: process.env.DB_USERNAME || `postgres`,
	password: process.env.DB_PASSWORD || `root`,
	database: process.env.DB_NAME || `videogallery`,
	logging: !!process.env.DB_LOGGING || false,
	synchronize: !!process.env.DB_SYNC || true,
	entities: [
		`./src/modules/**/*.model.ts`
	]
}
