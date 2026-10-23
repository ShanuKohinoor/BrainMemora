
import express from "express"
import { verifyUser } from "../middlewares/verifyUser.js";

import {
        createLearningMaterial,
        getAllLearningMaterial,
        getOneMaterial,
        updateMaterial,
        deleteMaterial,
        togglePinMaterial,    
} from "../controllers/learningMaterialController.js"

const router = express.Router()

// Learning Material
router.post('/learningMaterial',verifyUser,createLearningMaterial)
router.get('/allLearningMaterials',verifyUser,getAllLearningMaterial)
router.get('/getLearningMaterial/:id',verifyUser,getOneMaterial)
router.patch('/updateOneMaterial/:id',verifyUser,updateMaterial)
router.delete('/deleteMaterial/:id',verifyUser,deleteMaterial)
router.patch('/pinned/:id',verifyUser,togglePinMaterial)


export default router