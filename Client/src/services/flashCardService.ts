
import {api} from "./api";
import type{ FlashcardBody } from "../types/flashcard.types";

// Fetch all flashcards from the backend.
export const getAllFlashcards = async () => {
    const response = await api.get("/api/flashcard/getAllFlashCards");
    return response.data.data;
};

// Create a new flashcard in the backend.
export const createFlashcard = async (data: FlashcardBody) => {
    const response = await api.post("/api/flashcard/createFlashcard", data);
    return response.data.data;
};

// Delete a flashcard from the backend.
export const deleteFlashcard = async (id: string) => {
    await api.delete(`/api/flashcard/deleteFlashCard/${id}`);
};