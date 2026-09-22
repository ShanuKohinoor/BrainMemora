interface Flashcard{
    id:string;
    userId:string;
    title:string;
    topic:string;
    tags?:string[];
    sources:FlashcardSource[];
    question:string;
    answer:string;
    createdAt:Date;
    updatedAt:Date;
}



interface FlashcardSource{
    sourceId: string
    sourceType: string
}
