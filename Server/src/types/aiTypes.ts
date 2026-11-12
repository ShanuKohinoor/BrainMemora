
// AI generation actions
export type AIAction = "flashcards" | "quiz" | "summarise" | "explain";

// Data received from the frontend for AI generation
export interface GenerateAIContentRequest {
    action: AIAction;
    topic: string;
    title?: string;
    difficulty?: string;
    level?: string;
    count?: number;
}

// Data received from the frontend for  prompt generation
export interface GenerateFromPromptRequest {
    prompt: string;
    allowGeneralAnswer?: boolean;
}
