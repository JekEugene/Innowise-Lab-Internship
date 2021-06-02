import * as bcrypt from 'bcrypt'
import * as jwt from 'jsonwebtoken'

import { ICreateUserDto } from '../users/dto/create-user.dto'
import { User } from '../users/users.model'
import { ITokens } from './tokens.interface'
import { Token } from './tokens.model'
import { IUserPayload } from './user-payload.interface'

export const authenticationService = {
	// async register(createUserDto: ICreateUserDto): Promise<unknown> {
	// 	const { login, password } = createUserDto
	// 	const user = await User.findOne({ where: { login: createUserDto.login } })
	// 	if (user) {
	// 		return false
	// 	}

	// 	const hashPassword = await bcrypt.hash(password, 10)
	// 	const newUser: ICreateUserDto = {
	// 		login,
	// 		password: hashPassword,
	// 	}
	// 	await User.create(newUser).save()

	// 	return newUser
	// },

	async findUser(login: string): Promise<User> {
		return await User.findOne({ where: { login } })
	},

	async hashPassword(password: string): Promise<string> {
		return await bcrypt.hash(password, 10)
	},

	async createUser(user: ICreateUserDto): Promise<User> {
		return await User.create(user).save()
	},


	async login(login: string, password: string): Promise<unknown> {
		try {
			const candidate = await User.findOne({ login })
			if (candidate) {
				const arePasswordsSame = await bcrypt.compare(
					password,
					candidate.password
				)
				if (arePasswordsSame) {
					const user = Object.create(candidate)
					
					const userPayload: IUserPayload = {
						id: user.id,
						login: user.login
					}

					const accessToken: string = jwt.sign(
						userPayload,
						process.env.ACCESS_SECRET_TOKEN,
						{ expiresIn: `10s` }
					)
					const refreshToken: string = jwt.sign(
						userPayload,
						process.env.REFRESH_SECRET_TOKEN,
						{ expiresIn: `7d` }
					)
					Token.create({ token: refreshToken, user_id: user.id })

					const tokens: ITokens = {
						accessToken,
						refreshToken
					}
					return tokens
				} else {
					return false
				}
			} else {
				return false
			}
		} catch (e) {
			console.log(e)
		}
	},
}
