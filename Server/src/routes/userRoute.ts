import express from "express"
import { verifyUser } from "../middlewares/verifyUser.js";
import {getProfile,updateProfile,createLearningMaterial, getAllLearningMaterial, getOneMaterial,updateMaterial,deleteMaterial} from "../controllers/userController.js"

const router = express.Router()


router.get('/profile',verifyUser,getProfile)
router.put('/profile', verifyUser, updateProfile)

router.post('/learningMaterial',verifyUser,createLearningMaterial)
router.get('/allLearningMaterials',verifyUser,getAllLearningMaterial)
router.get('/getLearningMaterial/:id',verifyUser,getOneMaterial)
router.patch('/updateOneMaterial/:id',verifyUser,updateMaterial)
router.delete('/deleteMaterial/:id',verifyUser,deleteMaterial)
export default router