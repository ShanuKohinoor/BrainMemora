// Import the shared Axios instance.
import {api} from "./api"
import type { CreateLearningMaterialBody } from "../types/learningMaterial.types"

// Fetch all learning materials from the backend.
export const getAllLearningMaterials = async()=>{
    // SEnd a GET request to the backend
    const response =await api.get("/api/user/allLearningMaterials")
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


// // Update Material
// export const updateMaterial  = async()=>{
//     const response = await api.post(
//         "/api/material/updateOneMaterial"
//     )
//     return response.data.data
// }