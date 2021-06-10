import winston, { format, createLogger, transports } from 'winston'
const { timestamp } = format

const errorStackTracerFormat = winston.format((info, timestamp) => {
	if (info.meta && info.meta instanceof Error) {
		info.message = `${timestamp} : ${info.meta.stack}`
	}
	return info
})

export const logger = createLogger({
	format: winston.format.combine(
		winston.format.splat(),
		timestamp({ format: `YYYY-MM-DD HH:mm:ss` }),
		errorStackTracerFormat(),
		winston.format.simple()
	),
	transports: new transports.File({
		filename: `error.log`,
	}),
})