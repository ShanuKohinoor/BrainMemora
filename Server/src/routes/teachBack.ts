
import express from "express"
import { verifyUser } from "../middlewares/verifyUser.js";

import {
        createTeachBack,
        getAllTeachBacks   
} from "../controllers/teachBackController.js"

import { uploadMiddleware } from "../middlewares/uploadMiddleware.js";


const router = express.Router()

// TeachBack
router.post('/createTeachBack',verifyUser,uploadMiddleware.single("file"),createTeachBack)
router.get('/getAllTeachBack',verifyUser,getAllTeachBacks)

export default router