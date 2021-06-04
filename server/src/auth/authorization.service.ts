import { NextFunction, Request, Response } from 'express'
import * as jwt from 'jsonwebtoken'
import { Token } from './tokens.model'
import { IUserPayload } from './user-payload.interface'

export const authService = {
	async authUser(req: Request, res: Response, next: NextFunction): Promise<void> {
		console.log(`new req`)
		if (req.cookies?.accessToken) {
			const token = req.cookies.accessToken
			return jwt.verify(token, process.env.ACCESS_SECRET_TOKEN, async (err: Error, user: IUserPayload) => {
				if (err) {
					console.log(err)
					console.log(`1`)
					await refreshToken(req, res)
					return next()
				} else {
					console.log(`2`)
					res.locals.auth = true
					res.locals.user = user
					return next()
				}
			})
		}
		
		if (req.cookies?.refreshToken) {
			console.log(`3`)
			await refreshToken(req, res)
			console.log(`ne dai bog`)
			return next()
		}
		console.log(`4`)
		res.locals.auth = false
		return next()
	},
}

async function refreshToken(req: Request, res: Response): Promise<void> {
	console.log(`4.5`)
	if (!req.cookies?.refreshToken) {
		console.log(`mimo krokodil`)
		res.locals.auth = false
		return
	}
	const token = req.cookies.refreshToken
	return jwt.verify(token, process.env.REFRESH_SECRET_TOKEN, async (err: Error, user: IUserPayload) => {
		if (err) {
			console.log(`5`)
			res.locals.auth = false
			console.log(`return 1`)
			return
		}
		const userPayload: IUserPayload = {
			id: user.id,
			login: user.login
		}
		const userToken = await Token.find({ where: { user_id: userPayload.id, token } })
		if (userToken) {
			console.log(`6`)
			const accessToken: string = jwt.sign(userPayload, process.env.ACCESS_SECRET_TOKEN, { expiresIn: `10s` })
			const refreshToken: string = jwt.sign(userPayload, process.env.REFRESH_SECRET_TOKEN, { expiresIn: `7d` })
			Token.delete({ user_id: userPayload.id, token })
			Token.create({ user_id: userPayload.id , token: refreshToken})
			res.cookie(`accessToken`, accessToken, {maxAge: 1000 * 10, httpOnly: true})
			res.cookie(`refreshToken`, refreshToken, { maxAge: 1000 * 60 * 60 * 24 * 7, httpOnly: true })
			res.locals.auth = true
			res.locals.user = userPayload
			res.locals.refreshToken = refreshToken
			console.log(`return 2`)
			return
		} else {
			console.log(`7`)
			res.locals.auth = false
			console.log(`return 3`)
			return
		}
	})
}