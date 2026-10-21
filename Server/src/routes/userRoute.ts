import express from "express"
import { verifyUser } from "../middlewares/verifyUser.js";
import {
    getProfile,
    updateProfile,
    createLearningMaterial,
    getAllLearningMaterial,
    getOneMaterial,
    updateMaterial,
    deleteMaterial,
    togglePinMaterial,
    uploadFile,
    replaceFile,
    createNote,
    getAllNotes,
    getNote,
    updateNote,
    deleteNote,
    createTeachBack,
    getAllTeachBacks
}
    from "../controllers/userController.js"
import { uploadMiddleware } from "../middlewares/uploadMiddleware.js";

const router = express.Router()


router.get('/profile',verifyUser,getProfile)
router.put('/profile', verifyUser,updateProfile)

// Learning Material
router.post('/learningMaterial',verifyUser,createLearningMaterial)
router.get('/allLearningMaterials',verifyUser,getAllLearningMaterial)
router.get('/getLearningMaterial/:id',verifyUser,getOneMaterial)
router.patch('/updateOneMaterial/:id',verifyUser,updateMaterial)
router.delete('/deleteMaterial/:id',verifyUser,deleteMaterial)
router.patch('/pinned/:id',verifyUser,togglePinMaterial)



// Notes
router.post('/createNote',verifyUser,createNote)
router.get('/getAllNotes',verifyUser,getAllNotes)
router.get('/getNote/:id',verifyUser,getNote)
router.patch('/updateNote/:id',verifyUser,updateNote)
router.delete('/deleteNote/:id',verifyUser,deleteNote)


//AWS Cloud
router.post('/upload',verifyUser,uploadMiddleware.single("file"),uploadFile)
router.patch('/replaceFile/:id',verifyUser,uploadMiddleware.single("file"),replaceFile)

// TeachBack
router.post('/createTeachBack',verifyUser,uploadMiddleware.single("file"),createTeachBack)
router.get('/getAllTeachBack',verifyUser,getAllTeachBacks)

export default router