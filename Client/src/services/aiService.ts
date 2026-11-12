
import { api } from "./api";


// Request data for Create with AI
interface GenerateAIContentRequest {
    action: "flashcards" | "quiz" | "summarise" | "explain";
    topic: string;
    title?: string;
    difficulty?: string;
    level?: string;
    count?: number;
}

// Request data for Prompt AI
interface GeneratePromptRequest {
    prompt: string;
    allowGeneralAnswer?: boolean;
}

// Generate AI content using saved learning materials
export const generateAIContent = async (data: GenerateAIContentRequest) => {
    const response = await api.post("/api/generate/generate", data);
    return response.data;
};

// Generate AI content using a prompt
export const generatePromptAI = async (data: GeneratePromptRequest) => {
    const response = await api.post("/api/generate/prompt", data);
    return response.data;
};

// Retrieve the user's AI generation history
export const getAIHistory = async () => {
    const response = await api.get("/api/generate/history");
    return response.data;
};
