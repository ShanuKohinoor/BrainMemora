// Import the shared Axios instance.
import {api} from "./api"
import type { CreateLearningMaterialBody } from "../types/learningMaterial.types"

// Fetch all learning materials from the backend.
export const getAllLearningMaterials = async()=>{
    // SEnd a GET request to the backend
    const response =await api.get("/api/material/allLearningMaterials")
    // Return the learning materials from the response
    return response.data.data
}


                    // CREATE MATERIAL


// Create material 
export const createMaterial = async(data:CreateLearningMaterialBody)=>{
    const response = await api.post(
        "/api/material/learningMaterial",
        data
    )
    return response.data
}



// Upload a selected file to the backend.
export const uploadMaterialFile = async (file: File) => {
    // FormData sends the actual file, not just its name.
    const formData = new FormData();
    formData.append("file", file);

    // Send the file to the existing backend upload endpoint.
    const response = await api.post(
        "/api/upload/upload",
        formData
    );

    // Return the uploaded file's URL and key.
    return response.data.data;
};




//  Update Material
// export const updateMaterial  = async()=>{
//     const response = await api.post(
//         "/api/material/updateOneMaterial"
//     )
//     return response.data.data
// }