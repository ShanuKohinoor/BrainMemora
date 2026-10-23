
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
