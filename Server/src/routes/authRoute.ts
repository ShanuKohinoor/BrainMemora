import express from "express"
import { registerUser,loginUser,getCurrentUser,logOutUser } from "../controllers/authController.js"
import { verifyUser } from "../middlewares/verifyUser.js"
import preventCache from "../middlewares/preventCache.js"
import { preventLogin } from "../middlewares/preventLogin.js"
const router = express.Router()




router.post('/register',registerUser)

router.post('/login',preventCache,preventLogin,loginUser)
router.get("/currentUser", verifyUser, getCurrentUser);

router.post('/logout',verifyUser,logOutUser)

export default router