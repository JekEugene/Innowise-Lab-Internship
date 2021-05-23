import { Router } from "express"
const userController = Router()

import { userService } from './users.service'


userController.get(`/`, userService.userPage)

export = userController
