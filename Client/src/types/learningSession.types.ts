export interface LearningSession{
    _id:string;
    userId:string;
    topic:string;
    title:string;
    description?:string;
    order:number;
    quizIds:string[];
    flashcardIds:string[];
    quizCompleted: boolean,
    flashcardCompleted: boolean,
    isUnlocked:boolean;
    isCompleted:boolean;
    createdAt:string;
    updatedAt:string;
    completedAt?:string
}
