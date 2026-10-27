
import { Router } from "express";
import {
  createQuiz,
  getAllQuizzes,
  getQuizById,
  updateQuiz,
  deleteQuiz,
  generateQuiz
} from "../controllers/quizController.js";

import { verifyUser } from "../middlewares/verifyUser.js";

const router = Router();


// Create a quiz.
router.post("/createquiz",verifyUser, createQuiz);

// Get all quizzes
router.get("/getAllQuizzes",verifyUser, getAllQuizzes);

// Get one quiz 
router.get("/getOneQuiz/:id",verifyUser, getQuizById);

// Update a quiz 
router.put("/updateQuiz/:id",verifyUser, updateQuiz);

// Delete a quiz 
router.delete("/delete/:id",verifyUser, deleteQuiz);

//Generate Quiz
router.post("/generate/",verifyUser, generateQuiz);


export default router;
