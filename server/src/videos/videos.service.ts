import { Request, Response} from 'express'

export const videoService = {
	async userPage (req: Request, res: Response) :Promise<void> {
		console.log(`hi`)
	}
}