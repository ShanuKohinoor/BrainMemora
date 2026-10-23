
import mongoose from "mongoose";
import type { Quiz, QuizQuestion, QuizSource } from "../types/quiz.types.js";

// Define the structure of a source linked to a quiz.
const quizSourceSchema = new mongoose.Schema<QuizSource>(
  {
    sourceId: {
      type: String,
      required: true,
    },
    sourceType: {
      type: String,
      enum: ["learningMaterial", "note"],
      required: true,
    },
  },
  { _id: false }
);

// Define the structure of one question in a quiz.
const quizQuestionSchema = new mongoose.Schema<QuizQuestion>(
  {
    question: {
      type: String,
      required: true,
    },
    options: {
      type: [String],
      required: true,
    },
    correctAnswer: {
      type: String,
      required: true,
    },
  },
  { _id: true }
);

// Define the structure of a quiz document.
const quizSchema = new mongoose.Schema<Quiz>(
  {
    userId: {
      type: String,
      required: true,
    },
    topic: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    sources: {
      type: [quizSourceSchema],
      required: true,
    },
    questions: {
      type: [quizQuestionSchema],
      required: true,
    },
  },
  { timestamps: true }
);

// Create and export the Quiz model.
export const quizModel = mongoose.model("Quiz", quizSchema);
