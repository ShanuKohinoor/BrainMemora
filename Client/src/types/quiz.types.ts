export interface Quiz{
    _id:string;
    userId:string;
    topic:string;
    title:string;
    sources:QuizSource[];
    questions:QuizQuestion[];
    createdAt:string;
    updatedAt:string;
}

export interface QuizQuestion{
    question:string
    options:string[];
    correctAnswer:string

}

export interface QuizSource{
    sourceType:string;
    sourceId:string;

}
