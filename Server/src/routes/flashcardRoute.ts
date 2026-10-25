import  express  from "express";
import { createFlashcard,generateFlashcardsFromNote,generateFlashcardsFromMaterials,getAllFlashCards, getOneFlashCard, deleteFlashCard,updateFlashCard } from "../controllers/flashcardController.js";
import { verifyUser } from "../middlewares/verifyUser.js";
const router = express.Router()

router.post('/createFlashcard',verifyUser,createFlashcard)
router.post("/generateFromMaterials",verifyUser, generateFlashcardsFromMaterials);
router.post("/generateFromNote",verifyUser, generateFlashcardsFromNote);
router.get('/getAllFlashCards',verifyUser,getAllFlashCards)
router.get('/getOneFlashCard/:id',verifyUser,getOneFlashCard)
router.delete('/deleteFlashCard/:id',verifyUser,deleteFlashCard)
router.put('/updateFlashCard/:id',verifyUser,updateFlashCard)


export default router;