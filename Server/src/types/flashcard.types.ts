
// Stores all flashcard details in the MongoDB
export interface Flashcard{
    _id:string;
    userId:string;
    title?:string;
    topic:string;
    tags?:string[];
    sources:FlashcardSource[];
    question:string;
    answer?:string;
    createdAt:Date;
    updatedAt:Date;
}


// Stores all flashcard source details
export interface FlashcardSource{
    sourceId: string
    sourceType: "note" | "learningMaterial"
}


// Data required to create a flashcard
export interface FlashcardBody{
    title?:string;
    topic:string;
    tags?:string[];
    sources:FlashcardSource[];
    question:string;
    answer?:string;
}