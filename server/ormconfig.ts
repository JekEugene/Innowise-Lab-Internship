export default {
	type: process.env.DB_TYPE || `postgres`,
	host: process.env.HOST || `localhost`,
	port: process.env.DB_PORT || 5432,
	username: process.env.DB_USERNAME || `postgres`,
	password: process.env.DB_PASSWORD || `root`,
	database: process.env.DB_NAME || `videogallery1`,
	logging: process.env.DB_LOGGING || false,
	synchronize: process.env.DB_SYNC || true,
}
