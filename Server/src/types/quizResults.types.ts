

// Stores the result of one question
export interface SingleQuizResult{
    question: string;              
    selectedAnswer:string;         
    correctAnswer:string;
    isCorrect:boolean;
    explanation?:string;
}

// Stores the result of one complete quiz attempt
export interface QuizResult{
    _id:string;                     
    userId:string;
    quizId:string;                
    score:number;                  
    totalQuestions:number;        
    correctAnswers:number;       
    answers: SingleQuizResult[];      
    completedAt:Date
}
