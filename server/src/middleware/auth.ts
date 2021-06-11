import { NextFunction, Request, Response } from 'express'
import * as jwt from 'jsonwebtoken'
import { logger } from '../config/logger'
import { authorizationService } from '../modules/auth/authorization.service'

export async function authUser(req: Request, res: Response, next: NextFunction): Promise<void> {
	if (req.cookies?.accessToken) {
		const token = req.cookies.accessToken
		let user
		try {
			user = jwt.verify(token, process.env.ACCESS_SECRET_TOKEN)
		} catch (err) {
			logger.error(``, err)
			await authorizationService.refreshToken(req, res)
			return next()
		}
		res.locals.auth = true
		res.locals.user = {
			id: user.id,
			login: user.login,
		}
		return next()
	}

	if (req.cookies?.refreshToken) {
		await authorizationService.refreshToken(req, res)
		return next()
	}
	res.locals.auth = false
	return next()
}

