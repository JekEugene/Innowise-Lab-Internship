import { Request, Response } from 'express'
import { getRepository } from 'typeorm'
import * as bcrypt from 'bcrypt'
import * as jwt from 'jsonwebtoken'

import { ICreateUserDto } from '../users/dto/create-user.dto'
import { User } from '../users/users.model'
import { Token } from './tokens.model'

export const authenticationService = {

	async register(req: Request, res: Response): Promise<unknown> {
		const { login, password } = req.body
		const user = await User.findOne({ where: { login } })
		if(user){
			return res.status(422).send(`user already exist`)
		}

		const hashPassword = await bcrypt.hash(password, 10)
		const newUser: ICreateUserDto = {
			login,
			password: hashPassword
		}
		await User.create(newUser).save()

		return res.status(201).send(`user created`)
	},

	async login(req: Request, res: Response): Promise<unknown> {
		const { login, password } = req.body
		const candidate = await User.findOne({ login })
		if (candidate) {
			const arePasswordsSame = await bcrypt.compare(password, candidate.password)
			if (arePasswordsSame) {
				const user = Object.create(candidate)

				const accessToken: string = jwt.sign(user, process.env.ACCESS_SECRET_TOKEN, { expiresIn: `10s` })
				const refreshToken: string = jwt.sign(user, process.env.REFRESH_SECRET_TOKEN, { expiresIn: `7d` })
				res.cookie(`accessToken`, accessToken,{maxAge: 1000 * 15, httpOnly: true})
				res.cookie(`refreshToken`, refreshToken, { maxAge: 1000 * 60 * 60 * 24 * 7, httpOnly: true })
				Token.create({ token: refreshToken, user_id: user.id })
				
				res.status(200)
			} else {
				return res.status(401)
			}
		} else {
			return res.status(401)
		}
	}
}