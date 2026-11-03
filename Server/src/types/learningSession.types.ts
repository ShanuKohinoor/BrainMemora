export interface LearningSession{
    _id:string;
    userId:string;
    topic:string;
    title:string;
    description?:string;
    order:number;
    quizIds:string[];
    passedQuizIds: string[];            // quizzes Ids passed with at least 80%
    flashcardIds:string[];
    quizCompleted:boolean;
    flashcardCompleted:boolean;
    isUnlocked:boolean;
    isCompleted:boolean
    createdAt:Date;
    updatedAt:Date;
    completedAt?:Date
}
