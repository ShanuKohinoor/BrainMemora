
import mongoose from "mongoose";
import type { QuizResult } from "../types/quizResults.types.js";

// Define the structure of a quiz result document.
const quizResultSchema = new mongoose.Schema<QuizResult>(
  {
    userId: {
      type: String,
      required: true,
    },
    quizId: {
      type: String,
      required: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
    },
    totalQuestions: {
      type: Number,
      required: true,
      min: 0,
    },
    correctAnswers: {
      type: Number,
      required: true,
      min: 0,
    },
    answers:[
      {
      _id:false,                  // To prevent automatically genrated id by mongoDB for each question result
      question:{
        type:String,
        required: true,
      },
       selectedAnswer:{
        type:String,
        required: true,
       },      
       correctAnswer:{
         type:String,
         required: true,
       }, 
       isCorrect:{
         type:Boolean,
         required:true
      },
       explanation:{
          type:String

      }
     }


      ],
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Create and export the QuizResult model.
export const quizResultModel = mongoose.model(
  "QuizResult",
  quizResultSchema
);
