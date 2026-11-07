import { submitQuizResult,getQuizHistory,deleteQuizAttempt,deleteSelectedQuizAttempts } from "../controllers/quizResultController.js";
import { Router } from "express";
import { verifyUser } from "../middlewares/verifyUser.js";

const router = Router();


router.post('/submitResult',verifyUser,submitQuizResult)
router.get('/history/:id', verifyUser, getQuizHistory)


// Delete one quiz attempt
router.delete("/history/attempt/:attemptId", verifyUser, deleteQuizAttempt);

// Delete selected quiz attempts
router.delete("/history/multiple", verifyUser, deleteSelectedQuizAttempts);


export default router;

