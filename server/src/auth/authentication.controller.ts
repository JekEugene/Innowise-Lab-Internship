import { Router } from "express"
const authController = Router()

import { authenticationService } from './authentication.service'

authController.post(`/register`, authenticationService.register)
authController.post(`/login`, authenticationService.login)

export = authController
