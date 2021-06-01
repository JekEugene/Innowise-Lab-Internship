import { NextFunction, Request, Response} from 'express'

export const authService = {
	async authUser (req: Request, res: Response, next: NextFunction) :Promise<void> {
		if (req.cookies?.accessToken) {
			
			next()
		} else {
			this.user = {role: `guest`}
		}
	},

	async refreshToken(): Promise<void> {
		console.log(`hi`)
	}
}