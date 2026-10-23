// Describes a flashcard returned by the backend.
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


// Describes a note or learning material linked to a flashcard.
export interface FlashcardSource{
    sourceId: string
    sourceType: string
}


// Describes the data sent to the backend when creating a flashcard.
export interface FlashcardBody {
    title?: string;
    topic: string;
    tags?: string[];
    sources: FlashcardSource[];
    question: string;
    answer: string;
}