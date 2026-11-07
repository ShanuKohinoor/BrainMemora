
import type { Quiz } from "../types/quiz.types";
import { api } from "./api";
import type { QuizResult } from "../types/quizResult.types"



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
  quizData: Omit<Quiz, "_id" | "userId" | "createdAt" | "updatedAt">
): Promise<Quiz> => {
  const response = await api.post("/api/quiz/createquiz", quizData);

  return response.data.quiz;
};




// Delete a saved quiz
export const deleteQuiz = async (id: string): Promise<void> => {
  await api.delete(`/api/quiz/delete/${id}`);
};





                        // QUIZ RESULTS

// Display Quiz results                        
export const showQuizResult = async (
    quizId:string,
    selectedAnswers:string[]
)=>{
    const response = await api.post('/api/quizResult/submitResult',{
        quizId,
        selectedAnswers
    })

     return response.data
}



// Fetch all attempts for a particular quiz
export const getQuizHistory = async (
  quizId: string
): Promise<QuizResult[]> => {
  const response = await api.get(`/api/quizResult/history/${quizId}`);

  return response.data.data;
};



// Delete one quiz attempt
export const deleteQuizAttempt = async (
  attemptId: string
): Promise<void> => {
  await api.delete(`/api/quizResult/history/attempt/${attemptId}`);
};


// Delete multiple selected quiz attempts
export const deleteSelectedQuizAttempts = async (
  attemptIds: string[]
): Promise<{ deletedCount: number }> => {
  const response = await api.delete(
    "/api/quizResult/history/multiple",
    {
      data: { attemptIds },
    }
  );

  return response.data;
};