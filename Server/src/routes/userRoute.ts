import express from "express"
import { verifyUser } from "../middlewares/verifyUser.js";
import {getProfile,updateProfile,createLearningMaterial} from "../controllers/userController.js"

const router = express.Router()


router.get('/profile',verifyUser,getProfile)
router.put('/profile', verifyUser, updateProfile)

router.post('/learningMaterial',verifyUser,createLearningMaterial)



export default router