import * as bcrypt from 'bcrypt'
import * as jwt from 'jsonwebtoken'
import { ICreateUserDto } from '../user/dto/create-user.dto'

import { User } from '../user/user.model'
import { userRepository } from '../user/user.repository'
import { tokenRepository } from './token.repository'
import { IUserPayload } from './user-payload.interface'

class AuthenticationService {

	public async deleteToken(userId: number, token: string): Promise<void> {
		tokenRepository.deleteToken(userId, token)
	}

	public async createToken(userId: number, token: string) {
		tokenRepository.createToken(userId, token)
	}

	async getUserByLogin(login: string): Promise<User> {
		return await userRepository.getUserByLogin(login)
	}

	async createUser(createUser: ICreateUserDto): Promise<void> {
		userRepository.createUser(createUser)
	}

	async hashPassword(password: string): Promise<string> {
		return await bcrypt.hash(password, 10)
	}

	async comparePasswords(user: User, password: string): Promise<boolean> {
		return await bcrypt.compare(password, user.password)
	}

	signAccessToken(userPayload: IUserPayload): string {
		return jwt.sign(userPayload, process.env.ACCESS_SECRET_TOKEN, {
			expiresIn: `10s`,
		})
	}
	signRefreshToken(userPayload: IUserPayload): string {
		return jwt.sign(userPayload, process.env.REFRESH_SECRET_TOKEN, {
			expiresIn: `15d`,
		})
	}
}

export const authenticationService = new AuthenticationService()