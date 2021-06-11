import { Router, Request, Response } from 'express'
const authController = Router()
import { authenticationService } from './authentication.service'
import { authUser } from '../../middleware/authUser'
import { logger } from '../../config/logger'
import { AppError } from '../../error/AppError'
import { isAuth } from '../../middleware/isAuth'

/**
 * @swagger
 * /auth/register:
 *   post:
 *     consumes:
 *     - application/json
 *     summary: create account
 *     tags:
 *     - auth
 *     parameters:
 *     - in: body
 *       name: registration
 *       schema:
 *         type: object
 *         required:
 *         - login
 *         - password
 *         properties:
 *           login:
 *             type: string
 *           password:
 *             type: string
 *     responses:
 *       201:
 *         description: Success
 *       422:
 *         description: User already exists
 */
authController.post(`/register`, async (req: Request, res: Response) => {
	try {
		const { login, password } = req.body

		await authenticationService.register(login, password)
		return res.redirect(201, `/login`)
	} catch (err) {
		logger.error(``, err)
		if (err instanceof AppError) {
			return res.status(err.statusCode).send(err.message)
		}
		return res.status(400).send(`unknown error`)
	}
})

/**
 * @swagger
 * /auth/login:
 *   post:
 *     consumes:
 *     - application/json
 *     summary: login to account
 *     tags:
 *     - auth
 *     parameters:
 *     - in: body
 *       name: registration
 *       schema:
 *         type: object
 *         required:
 *         - login
 *         - password
 *         properties:
 *           login:
 *             type: string
 *           password:
 *             type: string
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: User not found
 */
authController.post(`/login`, async (req: Request, res: Response) => {
	try {
		const { login, password } = req.body
		const { accessToken, refreshToken, userId } =
			await authenticationService.login(login, password)

		res.cookie(`accessToken`, accessToken, {
			maxAge: 1000 * 15,
			httpOnly: true,
		})
		res.cookie(`refreshToken`, refreshToken, {
			maxAge: 1000 * 60 * 60 * 24 * 7,
			httpOnly: true,
		})
		res.cookie(`login`, login, { maxAge: 1000 * 60 * 60 * 24 * 7 })
		res.cookie(`id`, userId, { maxAge: 1000 * 60 * 60 * 24 * 7 })
		return res.redirect(200, `/`)
	} catch (err) {
		logger.error(``, err)
		if (err instanceof AppError) {
			return res.status(err.statusCode).send(err.message)
		}
		return res.status(400).send(`unknown error`)
	}
})

/**
 * @swagger
 * /auth/logout:
 *   get:
 *     summary: logout from accout
 *     tags:
 *     - auth
 *     responses:
 *       200:
 *         description: Success
 *       401:
 *         description: You are not logged in
 */
authController.get(
	`/logout`,
	authUser,
	isAuth,
	async (req: Request, res: Response) => {
		try {
			const refreshToken: string = res.locals.refreshToken
			const userId: number = res.locals.user.id
			await authenticationService.logout(refreshToken, userId)
		} catch (err) {
			logger.error(``, err)
		}
		res
			.clearCookie(`accessToken`)
			.clearCookie(`refreshToken`)
			.clearCookie(`id`)
			.clearCookie(`login`)
		return res.redirect(200, `/`)
	}
)

export = authController
