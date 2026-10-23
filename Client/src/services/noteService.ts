
import { api } from "./api";
import type { Note } from "../types/note.types";

// Fetch all notes
export const getAllNotes = async () => {
    const response = await api.get("/api/user/getAllNotes");
    return response.data.data;
};

// Create a note
export const createNote = async (data: Note) => {
    const response = await api.post(
        "/api/note/createNote",
        data
    );
    return response.data;
};

// Update a note
export const updateNote = async (
    id: string,
    data: Partial<Note>
) => {
    const response = await api.patch(
        `/api/note/updateNote/${id}`,
        data
    );
    return response.data;
};

// Delete a note
export const deleteNote = async (id: string) => {
    const response = await api.delete(
        `/api/note/deleteNote/${id}`
    );
    return response.data;
};
