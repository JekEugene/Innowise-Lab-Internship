import { NextFunction, Request, Response } from 'express'

export function isAuth(req: Request, res: Response, next: NextFunction) {
	if (res.locals.auth === false) {
		return res.status(401).send(`You are not logged in`)
	}
	next()
}