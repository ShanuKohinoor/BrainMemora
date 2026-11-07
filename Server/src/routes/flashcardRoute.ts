import  express  from "express";
import { generateFlashcardsFromNote,generateFlashcardsFromMaterials,getAllFlashCards, getOneFlashCard, 
    deleteFlashCard,updateFlashCard,completeFlashcardReview} from "../controllers/flashcardController.js";
import { verifyUser } from "../middlewares/verifyUser.js";
const router = express.Router()

// router.post('/createFlashcard',verifyUser,createFlashcard)
router.post("/generateFromMaterials",verifyUser, generateFlashcardsFromMaterials);
router.post("/generateFromNote",verifyUser, generateFlashcardsFromNote);
router.get('/getAllFlashCards',verifyUser,getAllFlashCards)
router.get('/getOneFlashCard/:id',verifyUser,getOneFlashCard)
router.delete('/deleteFlashCard/:id',verifyUser,deleteFlashCard)
router.put('/updateFlashCard/:id',verifyUser,updateFlashCard)
router.post("/completeReview", verifyUser, completeFlashcardReview);

export default router;

