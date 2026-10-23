
import express from "express"
import { verifyUser } from "../middlewares/verifyUser.js";

import {
        uploadFile,
        replaceFile,
    
} from "../controllers/uploadController.js"
import { uploadMiddleware } from "../middlewares/uploadMiddleware.js";


const router = express.Router()




//AWS Cloud
router.post('/upload',verifyUser,uploadMiddleware.single("file"),uploadFile)
router.patch('/replaceFile/:id',verifyUser,uploadMiddleware.single("file"),replaceFile)

export default router