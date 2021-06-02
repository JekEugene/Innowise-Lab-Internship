import { Router, Request, Response } from "express"
import { ICreateUserDto } from "../users/dto/create-user.dto"
const authController = Router()

import { authenticationService } from './authentication.service'
import { ITokens } from "./tokens.interface"

authController.post(`/register`, async (req: Request, res: Response) => {
	const newUser: ICreateUserDto = req.body
	const result: ICreateUserDto | boolean = await authenticationService.register(newUser)
	if (result) {
		return res.status(201).send(`user created`)
	} else {
		return res.status(422).send(`user already exist`)
	}
})
authController.post(`/login`, async (req: Request, res: Response) => {
	const result: ITokens | boolean = await authenticationService.login(req.body.login, req.body.password)
	if (result) {
		res.cookie(`accessToken`, result[0], {
			maxAge: 1000 * 15,
			httpOnly: true,
		})
		res.cookie(`refreshToken`, result[1], {
			maxAge: 1000 * 60 * 60 * 24 * 7,
			httpOnly: true,
		})
		res.status(200)
	} else {
		res.status(401)
	}
})

export = authController
