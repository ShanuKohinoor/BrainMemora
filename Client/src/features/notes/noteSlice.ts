
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import type { Note } from "../../types/note.types";
import { getAllNotes } from "../../services/noteService";

// Fetch all notes from the backend
export const fetchNotes = createAsyncThunk(
    "notes/fetchAll",
    async () => {
        const data = await getAllNotes();
        return data;
    }
);

// Define the state for notes
interface NoteState {
    notes: Note[];
    loading: boolean;
    error: string | null;
}

// Set the initial state
const initialState: NoteState = {
    notes: [],
    loading: false,
    error: null
};

// Create the notes slice
const noteSlice = createSlice({
    name: "notes",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // When the request starts
            .addCase(fetchNotes.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            // When notes are fetched successfully
            .addCase(fetchNotes.fulfilled, (state, action) => {
                state.loading = false;
                state.notes = action.payload;
                state.error = null;
            })

            // When the request fails
            .addCase(fetchNotes.rejected, (state) => {
                state.loading = false;
                state.error = "Failed to fetch notes";
            });
    }
});

export default noteSlice.reducer;
