import { Request, Response } from 'express'
import { getRepository } from 'typeorm'
import { User } from '../users/users.model'
import * as bcrypt from 'bcrypt'
import { ICreateUserDto } from '../users/dto/create-user.dto'

export const authenticationService = {
	async register(req: Request, res: Response): Promise<unknown> {
		const { name, password } = req.body
		const userRep = getRepository(User)
		const user = await userRep.findOne({ where: { name }})
		if(user){
			return res.status(422).send(`user already exist`)
		}

		const hashPassword = await bcrypt.hash(password, 10)
		const newUser: ICreateUserDto = {
			name,
			password: hashPassword
		}

		await User.create(newUser).save()

		res.status(201).send(`user created`)
	},
	async login(req: Request, res: Response): Promise<void> {
		console.log()
	}
}