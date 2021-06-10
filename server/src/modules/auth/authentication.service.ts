import * as bcrypt from 'bcrypt'
import * as jwt from 'jsonwebtoken'
import { EntityAlreadyExistsError } from '../../error/EntityAlreadyExistsError'
import { NotFoundError } from '../../error/NotFoundError'
import { ValidationError } from '../../error/ValidationError'
import { ICreateUserDto } from '../user/dto/create-user.dto'

import { User } from '../user/user.model'
import { userRepository } from '../user/user.repository'
import { tokenRepository } from './token.repository'
import { IUserPayload } from './user-payload.interface'

class AuthenticationService {

	public async deleteToken(userId: number, token: string): Promise<void> {
		tokenRepository.deleteToken(userId, token)
	}

	public async createToken(userId: number, token: string): Promise<void> {
		tokenRepository.createToken(userId, token)
	}
	
	public async isUserExists(login): Promise<void> {
		const user: User = await userRepository.getUserByLogin(login)
		if (user) {
			throw new EntityAlreadyExistsError(`user already exists`)
		}
	}

	public async getUserByLogin(login: string): Promise<User> {
		const user: User = await userRepository.getUserByLogin(login)
		if (!user) {
			throw new NotFoundError(`user not found`)
		}
		return user
	}

	async createUser(createUser: ICreateUserDto): Promise<void> {
		userRepository.createUser(createUser)
	}

	async hashPassword(password: string): Promise<string> {
		return await bcrypt.hash(password, 10)
	}

	async comparePasswords(user: User, password: string): Promise<void> {
		const arePasswordsSame: boolean = await bcrypt.compare(password, user.password)
		if (!arePasswordsSame) {
			throw new ValidationError(`incorrect password`)
		}
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