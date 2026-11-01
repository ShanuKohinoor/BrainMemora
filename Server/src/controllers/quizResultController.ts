import { quizModel } from "../models/quiz.js";
import { quizResultModel } from "../models/quizResult.js";
import type { QuizResult } from "../types/quizResults.types.js";
import { BadRequest, NotFoundError, UnauthorizedError } from "../utils/error.js";
import type { Request,Response } from "express";

export const submitQuizResult = async(
    req:Request,
    res:Response
)=>{
   if(!req.userId){
      throw new UnauthorizedError("Please login first")
   }


   const userId = req.userId;
   const {quizId,selectedAnswers} = req.body;

     // Check whether selectedAnswers is an array
   if(!Array.isArray(selectedAnswers)){
    throw new BadRequest("Selected answers must be an array")
   }


   // Find the quiz need to get its correct answer
   const quiz = await quizModel.findOne({
      _id:quizId,                             
      userId
   })

   if(!quiz){
    throw new NotFoundError("Quiz not found")
   }

   if(selectedAnswers.length !== quiz.questions.length){
      throw new BadRequest("Please fill all the questions")
   }


// Compare each selected answer with the correct answer and store the result
   const answers = quiz.questions.map((question,index)=>{
       // Get the users selected answer for the current question
        const selectedAnswer = selectedAnswers[index]
       // Check whether the selected answer is correct 
        const isCorrect = selectedAnswer === question.correctAnswer

        // Return the question details and the users answer(including whether it is correct or not)
        return {
            question:question.question,
            selectedAnswer: selectedAnswer,
            isCorrect,
            correctAnswer:question.correctAnswer
        }
   })

   const totalQuestions = quiz.questions.length;

   //Count the no:of corrected answers
   const correctAnswers = answers.filter((answer)=>
    {
       return answer.isCorrect === true
    }).length



    const score = correctAnswers;
    const savedResult= await quizResultModel.create({
        userId,
        quizId,
        score,
        totalQuestions,      // Total questions in the quiz
        correctAnswers,      // No:of correction answers
        answers              // Details of each question and users answer
    })

   return res.status(201).json({
     message: "Quiz Result submitted successfully",
     success:true,
     data:savedResult
   })
}
















// Get all attempts for a particular quiz
export const getQuizHistory = async (
  req: Request,
  res: Response
) => {
  if (!req.userId) {
    throw new UnauthorizedError("Please login first");
  }

  const userId = req.userId;
const quizId = req.params.quizId;

if (!quizId || Array.isArray(quizId)) {
  throw new BadRequest("Invalid quiz ID");
}

  // Check whether the quiz belongs to the logged-in user
  const quiz = await quizModel.findOne({
    _id: quizId,
    userId,
  });

  if (!quiz) {
    throw new NotFoundError("Quiz not found");
  }

  // Find all attempts for this quiz and sort newest first
  const history = await quizResultModel
    .find({ quizId, userId })
    .sort({ completedAt: -1 });

  return res.status(200).json({
    success: true,
    data: history,
  });
};
