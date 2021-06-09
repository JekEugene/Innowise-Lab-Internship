import * as bcrypt from 'bcrypt'
import * as jwt from 'jsonwebtoken'

import { ICreateUserDto } from '../user/dto/create-user.dto'
import { User } from '../user/user.model'
import { Token } from './token.model'
import { IUserPayload } from './user-payload.interface'

export const authenticationService = {
	async findUser(login: string): Promise<User> {
		return await User.findOne({ where: { login } })
	},

	async hashPassword(password: string): Promise<string> {
		return await bcrypt.hash(password, 10)
	},

	async createUser(user: ICreateUserDto): Promise<User> {
		return await User.create(user).save()
	},

	async comparePasswords(user: User, password: string): Promise<boolean> {
		return await bcrypt.compare(password, user.password)
	},

	async createRefreshToken(userId: number, token: string): Promise<Token> {
		return await Token.create({ token, user_id: userId }).save()
	},

	signAccessToken(userPayload: IUserPayload): string {
		return jwt.sign(userPayload, process.env.ACCESS_SECRET_TOKEN, {
			expiresIn: `10s`,
		})
	},
	signRefreshToken(userPayload: IUserPayload): string {
		return jwt.sign(userPayload, process.env.REFRESH_SECRET_TOKEN, {
			expiresIn: `15d`,
		})
	},

	deleteToken(token: string, userId: number): Promise<void> {
		Token.delete({ user_id: userId, token })
		return
	},
}
