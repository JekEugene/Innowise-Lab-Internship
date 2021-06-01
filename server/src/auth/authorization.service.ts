import { NextFunction, Request, Response } from 'express'
import * as jwt from 'jsonwebtoken'
import { getRepository } from "typeorm"
import { Token } from './tokens.model'
import { IUserPayload } from './user-payload.interface'

export const authService = {
	async authUser(req: Request, res: Response, next: NextFunction): Promise<void> {
		if (req.cookies?.accessToken) {
			const token = req.cookies.accessToken
			jwt.verify(token, process.env.ACCESS_SECRET_TOKEN, async (err: Error, user: IUserPayload) => {
				if (err) {
					console.log(err)
					await this.refreshToken(req, res)
					next()
				} else {
					res.locals.auth = true
					res.locals.user = user
					next()
				}
			})
		}
		if (req.cookies?.refreshToken) {
			await this.refreshToken(req, res)
			next()
		}
		res.locals.auth = false
		next()
	},

	async refreshToken(req: Request, res: Response): Promise<void> {
		if (!req.cookies?.refreshTpken) {
			res.locals.auth = false
			return
		}
		const token = req.cookies.refreshToken
		jwt.verify(token, process.env.REFRESH_SECRET_TOKEN, async (err: Error, user: IUserPayload) => {
			if (err) {
				res.locals.auth = false
				return
			}
			const tokenRep = getRepository(Token)
			const tokens = await tokenRep.find({ where: { user_id: user.id } })
			const userToken = tokens.find(userToken => userToken.token === token ? true : false)
			if (userToken) {
				const accessToken: string = jwt.sign(user, process.env.ACCESS_SECRET_TOKEN, { expiresIn: `10s` })
				const refreshToken: string = jwt.sign(user, process.env.REFRESH_SECRET_TOKEN, { expiresIn: `7d` })
				res.cookie(`accessToken`, accessToken, {maxAge: 1000 * 10, httpOnly: true})
				res.cookie(`refreshToken`, refreshToken, { maxAge: 1000 * 60 * 60 * 24 * 7, httpOnly: true })
				res.locals.auth = true
				res.locals.user = user
				return
			} else {
				res.locals.auth = false
				return
			}
		})
	}
}