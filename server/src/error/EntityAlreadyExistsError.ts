import { AppError } from "./AppError"

export class EntityAlreadyExistsError extends AppError {
	constructor(message: string) {
		super(message)
		this.name = `EntityAlreadyExistsError`
		this.statusCode = 422
	}
}