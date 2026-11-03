import { submitQuizResult,getQuizHistory } from "../controllers/quizResultController.js";
import { Router } from "express";
import { verifyUser } from "../middlewares/verifyUser.js";

const router = Router();


router.post('/submitResult',verifyUser,submitQuizResult)
router.get('/history/:id', verifyUser, getQuizHistory)

export default router;

