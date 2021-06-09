import { NextFunction, Request, Response } from 'express'
import * as jwt from 'jsonwebtoken'
import { logger } from '../../middleware/logger'
import { tokenRepository } from './token.repository'
import { IUserPayload } from './user-payload.interface'

class AuthService {
	public async authUser(
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<void> {
		if (req.cookies?.accessToken) {
			const token = req.cookies.accessToken
			return jwt.verify(
				token,
				process.env.ACCESS_SECRET_TOKEN,
				async (err: Error, user: IUserPayload) => {
					if (err) {
						logger.error(``, err)
						await this.refreshToken(req, res)
						return next()
					}
					res.locals.auth = true
					res.locals.user = user
					return next()
				}
			)
		}

		if (req.cookies?.refreshToken) {
			await this.refreshToken(req, res)
			return next()
		}
		res.locals.auth = false
		return next()
	}
	
	private async refreshToken(req: Request, res: Response): Promise<void> {
		if (!req.cookies?.refreshToken) {
			res.locals.auth = false
			return
		}
		const token = req.cookies.refreshToken
		return jwt.verify(
			token,
			process.env.REFRESH_SECRET_TOKEN,
			async (err: Error, user: IUserPayload) => {
				if (err) {
					logger.error(``, err)
					res.locals.auth = false
					return
				}
				const userPayload: IUserPayload = {
					id: user.id,
					login: user.login,
				}
				const userToken = tokenRepository.getToken(userPayload.id, token)
				if (!userToken) {
					res.locals.auth = false
					return
				}
				const accessToken: string = jwt.sign(
					userPayload,
					process.env.ACCESS_SECRET_TOKEN,
					{ expiresIn: `10s` }
				)
				const refreshToken: string = jwt.sign(
					userPayload,
					process.env.REFRESH_SECRET_TOKEN,
					{ expiresIn: `7d` }
				)
				tokenRepository.deleteToken(userPayload.id, token)
				tokenRepository.createToken(userPayload.id, refreshToken)
				res.cookie(`accessToken`, accessToken, {
					maxAge: 1000 * 10,
					httpOnly: true,
				})
				res.cookie(`refreshToken`, refreshToken, {
					maxAge: 1000 * 60 * 60 * 24 * 7,
					httpOnly: true,
				})
				res.cookie(`login`, user.login, {maxAge: 1000 * 60 * 60 * 24 * 7})
				res.cookie(`id`, user.id, {maxAge: 1000 * 60 * 60 * 24 * 7})
				res.locals.auth = true
				res.locals.user = userPayload
				res.locals.refreshToken = refreshToken
				return
			}
		)
	}
}


export const authService = new AuthService()