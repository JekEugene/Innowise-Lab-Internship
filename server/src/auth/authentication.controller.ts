import { Router, Request, Response } from "express"
import { ICreateUserDto } from "../users/dto/create-user.dto"
import { IUserPayload } from "./user-payload.interface"
const authController = Router()
import { authenticationService } from './authentication.service'

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
	return res.status(201).send(`user created`)
	
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
	})
	res.cookie(`refreshToken`, refreshToken, {
		maxAge: 1000 * 60 * 60 * 24 * 7,
		httpOnly: true,
	})
	res.cookie(`id`, user.id)
	res.cookie(`login`, user.login)
	return res.status(200).send(`logged in`)
})

export = authController
