import { Router, Request, Response } from "express"
import { ICreateUserDto } from "../users/dto/create-user.dto"
import { IUserPayload } from "./user-payload.interface"
const authController = Router()
import { authenticationService } from './authentication.service'
import { authService } from "./authorization.service"

authController.post(`/register`, async (req: Request, res: Response) => {
	const { login, password } = req.body
	const user = await authenticationService.findUser(login)
	if (user) {
		return res.status(422).send(`user already exist`)
	}
	const hashPassword = await authenticationService.hashPassword(password)
	const newUser: ICreateUserDto = {
		login,
		password: hashPassword
	}
	authenticationService.createUser(newUser)
	return res.redirect(201, `/login`)
})

authController.post(`/login`, async (req: Request, res: Response) => {
	const { login, password } = req.body
	const user = await authenticationService.findUser(login)
	if (!user) {
		return res.status(401).send(`user does not exist`)
	}
	const arePasswordsSame: boolean = await authenticationService.comparePasswords(user, password)
	if (!arePasswordsSame) {
		return res.status(401).send(`wrong password`)
	}

	const userPayload: IUserPayload = {
		id: user.id,
		login: user.login
	}

	const refreshToken = authenticationService.signRefreshToken(userPayload)
	authenticationService.createRefreshToken(user.id, refreshToken)
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
	res.cookie(`id`, user.id, {path: `/`})
	res.cookie(`login`, user.login, {path: `/`})
	return res.redirect(200, `/`)
})

authController.get(`/logout`, authService.authUser, async (req: Request, res: Response) => {
	if (!res.locals.auth) {
		return res.status(401).send(`you are not logged in`)
	}
	authenticationService.deleteToken(res.locals.refreshToken, res.locals.user.id)
	res.clearCookie(`accessToken`)
		.clearCookie(`refreshToken`)
		.clearCookie(`id`)
		.clearCookie(`login`)
	return res.redirect(200, `/`)
})

export = authController
