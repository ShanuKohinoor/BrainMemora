import express from "express"
import { verifyUser } from "../middlewares/verifyUser.js";
import {
    getProfile,
    deleteProfile,
    updateProfile
}
    from "../controllers/userController.js"

const router = express.Router()


router.get('/profile',verifyUser,getProfile)
router.delete('/delete',verifyUser,deleteProfile)
router.put('/profile', verifyUser,updateProfile)


export default router