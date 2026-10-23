export interface Flashcard{
    _id:string;
    userId:string;
    title:string;
    topic:string;
    tags?:string[];
    sources:FlashcardSource[];
    question:string;
    answer:string;
    createdAt:string;
    updatedAt:string;
}



export interface FlashcardSource{
    sourceId: string
    sourceType: string
}
