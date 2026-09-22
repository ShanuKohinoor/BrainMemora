interface Quiz{
    id:string;
    userId:string;
    topic:string;
    title:string;
    sources:QuizSource[];
    questions:QuizQuestion[];
    createdAt:Date;
    updatedAt:Date;
}

interface QuizQuestion{
    question:string
    options:string[];
    correctAnswer:string

}

interface QuizSource{
    sourceType:string;
    sourceId:string;

}
