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
	public async register(login: string, password: string): Promise<void> {
		await this.isUserExists(login)
		const hashPassword = await this.hashPassword(password)
		const newUser: ICreateUserDto = {
			login,
			password: hashPassword,
		}
		this.createUser(newUser)
	}

	public async login<T>(login: string, password: string): Promise<T> {
		const user = await this.getUserByLogin(login)
		await this.comparePasswords(user, password)

		const userPayload: IUserPayload = {
			id: user.id,
			login: user.login,
		}

		const refreshToken = this.signRefreshToken(userPayload)
		this.createToken(user.id, refreshToken)
		const accessToken = this.signAccessToken(userPayload)
		return <T>(<unknown>{ accessToken, refreshToken, userId: user.id })
	}

	public async logout(refreshToken: string, userId: number): Promise<void> {
		this.deleteToken(userId, refreshToken)
	}

	private async deleteToken(userId: number, token: string): Promise<void> {
		tokenRepository.deleteToken(userId, token)
	}

	private async createToken(userId: number, token: string): Promise<void> {
		tokenRepository.createToken(userId, token)
	}

	private async isUserExists(login): Promise<void> {
		const user: User = await userRepository.getUserByLogin(login)
		if (user) {
			throw new EntityAlreadyExistsError(`user already exists`)
		}
	}

	private async getUserByLogin(login: string): Promise<User> {
		const user: User = await userRepository.getUserByLogin(login)
		if (!user) {
			throw new NotFoundError(`user not found`)
		}
		return user
	}

	private async createUser(createUser: ICreateUserDto): Promise<void> {
		userRepository.createUser(createUser)
	}

	private async hashPassword(password: string): Promise<string> {
		return await bcrypt.hash(password, 10)
	}

	private async comparePasswords(user: User, password: string): Promise<void> {
		const arePasswordsSame: boolean = await bcrypt.compare(
			password,
			user.password
		)
		if (!arePasswordsSame) {
			throw new ValidationError(`incorrect password`)
		}
	}

	private signAccessToken(userPayload: IUserPayload): string {
		return jwt.sign(userPayload, process.env.ACCESS_SECRET_TOKEN, {
			expiresIn: `10s`,
		})
	}
	private signRefreshToken(userPayload: IUserPayload): string {
		return jwt.sign(userPayload, process.env.REFRESH_SECRET_TOKEN, {
			expiresIn: `15d`,
		})
	}
}

export const authenticationService = new AuthenticationService()
