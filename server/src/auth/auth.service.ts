import { Request, Response} from 'express'

export const authService = {
	async userPage (req: Request, res: Response) :Promise<void> {
		console.log(`hi`)
	}
}