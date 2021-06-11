import { AppError } from "./AppError"

export class ForbiddenError extends AppError {
	constructor(message: string) {
		super(message)
		this.name = `ForbiddenError`
		this.statusCode = 403
	}
}