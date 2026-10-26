
export interface QuizSource{
    sourceType: "learningMaterial" | "note";
    sourceId:string;

}


export interface Quiz{
    id:string;
    userId:string;
    topic:string;
    title:string;
    sources:QuizSource[];
    questions:QuizQuestion[];
    createdAt:Date;
    updatedAt:Date;
}

export interface QuizQuestion{
    question:string
    options:string[];
    correctAnswer:string

}

