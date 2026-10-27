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


// Fetch one learnimng material
export const getOneMaterial = async(id:string)=>{
    const response = await api.get(`/api/material/getLearningMaterial/${id}`)
    return response.data.data
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




                    // CREATE MATERIAL


// Create material 
export const createMaterial = async(data:CreateLearningMaterialBody)=>{
    const response = await api.post(
        "/api/material/learningMaterial",
        data
    )
    return response.data
}




//  Update Material
export const updateMaterial  = async(
    id:string,
    data: Partial<Pick<CreateLearningMaterialBody, "title" | "topic" | "type">>
)=>{
    const response = await api.patch(
        `/api/material/updateOneMaterial/${id}`,
        data
    )
    return response.data
}




// Delete material

export const deleteMaterial  = async(id:string)=>{
    const response = await api.delete(
        `/api/material/deleteMaterial/${id}`
    )
    return response.data
}

