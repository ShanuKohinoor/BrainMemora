

// Stores the result of one question
export interface SingleQuizResult{
    question: string;              // Quiz question
    selectedAnswer:string;         
    correctAnswer:string;
    isCorrect:boolean;
    explanation?:string;
}



// Stores the result of one complete quiz attempt
export interface QuizResult{
    _id:string;                     // ID of the current result
    userId:string;
    quizId:string;                 // ID of the original quiz
    score:number;                  // Total scores obtained
    totalQuestions:number;         // Total no:of questions
    correctAnswers:number;         // No:of corrected answers
    answers: SingleQuizResult[];      // Results of all individual questions
    completedAt:string
}
