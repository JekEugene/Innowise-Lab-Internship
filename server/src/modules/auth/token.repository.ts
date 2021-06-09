import { Token } from "./token.model"

class TokenRepository {
	public async createToken(userId: number, token: string) {
		return await Token.create({ token, user_id: userId }).save()
	}

	public async getToken(userId: number, token: string) {
		return await Token.find({ where: { user_id: userId, token }})
	}

	public async deleteToken(userId: number, token: string): Promise<void> {
		Token.delete({ user_id: userId, token })
	}
}

export const tokenRepository = new TokenRepository()