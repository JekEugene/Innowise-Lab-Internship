import { Router, Request, Response } from 'express'
import { ICreateUserDto } from '../user/dto/create-user.dto'
import { IUserPayload } from './user-payload.interface'
const authController = Router()
import { authenticationService } from './authentication.service'
import { authUser } from '../../middleware/auth'
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
		await authenticationService.isUserExists(login)
		const hashPassword = await authenticationService.hashPassword(password)
		const newUser: ICreateUserDto = {
			login,
			password: hashPassword,
		}
		authenticationService.createUser(newUser)
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
		const user = await authenticationService.getUserByLogin(login)
		await authenticationService.comparePasswords(user, password)

		const userPayload: IUserPayload = {
			id: user.id,
			login: user.login,
		}

		const refreshToken = authenticationService.signRefreshToken(userPayload)
		authenticationService.createToken(user.id, refreshToken)
		const accessToken = authenticationService.signAccessToken(userPayload)

		res.cookie(`accessToken`, accessToken, {
			maxAge: 1000 * 15,
			httpOnly: true,
			path: `/`,
		})
		res.cookie(`refreshToken`, refreshToken, {
			maxAge: 1000 * 60 * 60 * 24 * 7,
			httpOnly: true,
			path: `/`,
		})
		res.cookie(`login`, user.login, { maxAge: 1000 * 60 * 60 * 24 * 7 })
		res.cookie(`id`, user.id, { maxAge: 1000 * 60 * 60 * 24 * 7 })
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
			authenticationService.deleteToken(
				res.locals.refreshToken,
				res.locals.user.id
			)
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
