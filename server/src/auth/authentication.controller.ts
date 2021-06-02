import { Router, Request, Response } from "express"
import { ICreateUserDto } from "../users/dto/create-user.dto"
import { User } from "../users/users.model"
const authController = Router()

import { authenticationService } from './authentication.service'
import { ITokens } from "./tokens.interface"

authController.post(`/register`, async (req: Request, res: Response) => {
	console.log(req.body)
	const { login, password } = req.body
	const user = await authenticationService.findUser(login)
	if (user) {
		return res.status(422).send(`user already exist`)
	} else {
		const hashPassword = await authenticationService.hashPassword(password)
		const newUser: ICreateUserDto = {
			login,
			password: hashPassword
		}
		authenticationService.createUser(newUser)
		return res.status(201).send(`user created`)
	}
})
authController.post(`/login`, async (req: Request, res: Response) => {
	// const result = await authenticationService.login(req.body.login, req.body.password)
	// if (result) {
	// 	res.cookie(`accessToken`, result.accessToken, {
	// 		maxAge: 1000 * 15,
	// 		httpOnly: true,
	// 	})
	// 	res.cookie(`refreshToken`, result[1], {
	// 		maxAge: 1000 * 60 * 60 * 24 * 7,
	// 		httpOnly: true,
	// 	})
	// 	res.status(200)
	// } else {
	// 	res.status(401)
	// }
	// const { login, password } = req.body
	// const user = await authenticationService.findUser(login)
	// if (user) {
	// 	const hashPassword = await authenticationService.hashPassword(password)
	// 	const newUser: User = await authenticationService.createUser(login, hashPassword)
	// } else {
	// 	res.status(401).send(`wrong login or password`)
	// }
})

export = authController
