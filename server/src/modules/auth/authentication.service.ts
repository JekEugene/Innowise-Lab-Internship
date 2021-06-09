import * as bcrypt from 'bcrypt'
import * as jwt from 'jsonwebtoken'

import { User } from '../user/user.model'
import { IUserPayload } from './user-payload.interface'

export const authenticationService = {

	async hashPassword(password: string): Promise<string> {
		return await bcrypt.hash(password, 10)
	},

	async comparePasswords(user: User, password: string): Promise<boolean> {
		return await bcrypt.compare(password, user.password)
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
}
