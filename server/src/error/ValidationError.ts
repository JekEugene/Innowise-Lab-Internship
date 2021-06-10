import { AppError } from "./AppError"

export class ValidationError extends AppError {
	constructor(message) {
		super(message)
		this.name = `ValidationError`
		this.statusCode = 400
	}
}