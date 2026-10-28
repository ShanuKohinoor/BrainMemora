
import type { Quiz } from "../types/quiz.types";
import { api } from "./api";




 // Generate quiz questions from selected learning materials
export const generateQuizQuestions = async (
  materialIds: string[],
  numberOfQuestions: number
) => {
  const response = await api.post("/api/quiz/generate", {
    materialIds,
    numberOfQuestions,
  });

  return response.data.questions;
};




// Fetch all quizzes belonging to the logged in user
export const getAllQuizzes = async (): Promise<Quiz[]> => {
  const response = await api.get("/api/quiz/getAllQuizzes");

  return response.data.quizzes;
};




// Fetch one quiz by its Id
export const getOneQuiz= async (id: string): Promise<Quiz> => {
  const response = await api.get(`/api/quiz/getOneQuiz/${id}`);

  return response.data.quiz;
};





// Save a generated quiz in MongoDB
export const createQuiz = async (
  quizData: Omit<Quiz, "id" | "userId" | "createdAt" | "updatedAt">
): Promise<Quiz> => {
  const response = await api.post("/api/quiz/createquiz", quizData);

  return response.data.quiz;
};




// Delete a saved quiz
export const deleteQuiz = async (id: string): Promise<void> => {
  await api.delete(`/api/quiz/delete/${id}`);
};
