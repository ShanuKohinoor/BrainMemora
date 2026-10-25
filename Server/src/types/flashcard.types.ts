
// Difficulty of each flash card
export type FlashCardDifficulty = "easy" | "medium" | "hard"



// Stores all flashcard details in the MongoDB
export interface Flashcard{
    _id:string;
    userId:string;
    title?:string;
    topic:string;
    tags?:string[];
    sources:FlashcardSource[];
    difficultyLevel:FlashCardDifficulty;
    question:string;
    answer?:string;
    createdAt:Date;
    updatedAt:Date;
}


// Stores the notes and learning materials linked to this flashcard.
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
    difficultyLevel:FlashCardDifficulty;
    question:string;
    answer?:string;
}