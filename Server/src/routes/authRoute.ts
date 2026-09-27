import express from "express"
import { registerUser,loginUser,logOutUser } from "../controllers/authController.js"
import { verifyUser } from "../middlewares/verifyUser.js"
const router = express.Router()




router.post('/register',registerUser)

router.post('/login',loginUser)

router.post('/logout',verifyUser,logOutUser)

export default router