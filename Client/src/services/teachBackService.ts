
import { api } from "./api";



// Save a new Teach Back recording
export const createTeachBack = async (data: FormData) => {
    const response = await api.post(
        "/api/teachBack/createTeachBack",
        data
    );

    return response.data;
};



// Get the saved Teach Back recordings
export const getAllTeachBacks = async () => {
    const response = await api.get("/api/teachBack/getAllTeachBack");
    return response.data.data;
};


