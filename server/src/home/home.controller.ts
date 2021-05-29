import { Router } from "express"
const homeController = Router()

import { homeService } from './home.service'

homeController.get(`/`, homeService.homePage)

export = homeController
