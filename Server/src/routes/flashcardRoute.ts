import  express  from "express";
import { createFlashcard,getAllFlashCards, getOneFlashCard, deleteFlashCard } from "../controllers/flashcardController.js";
import { verifyUser } from "../middlewares/verifyUser.js";
const router = express.Router()


router.post('/createFlashcard',verifyUser,createFlashcard)
router.get('/getAllFlashCards',verifyUser,getAllFlashCards)
router.get('/getOneFlashCard/:id',verifyUser,getOneFlashCard)
router.delete('/deleteFlashCard/:id',verifyUser,deleteFlashCard)


export default router;