import express from "express"
import { verifyUser } from "../middlewares/verifyUser.js";

import {
        createNote,
        getAllNotes,
        getNote,
        updateNote,
        deleteNote  
} from "../controllers/noteController.js"

const router = express.Router()


// Notes
router.post('/createNote',verifyUser,createNote)
router.get('/getAllNotes',verifyUser,getAllNotes)
router.get('/getNote/:id',verifyUser,getNote)
router.patch('/updateNote/:id',verifyUser,updateNote)
router.delete('/deleteNote/:id',verifyUser,deleteNote)
import { uploadMiddleware } from "../middlewares/uploadMiddleware.js";



export default router