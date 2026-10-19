//Import redux toolkit functions
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Import learningmaterial type
import type{ LearningMaterial } from "../../types/learningMaterial.types";

// Import the function that fetches materials from the backend
import { getAllLearningMaterials } from "../../services/learningMaterialService";


//Fetch all learning material from the backend
export const fetchLearningMaterials = createAsyncThunk(
      "learningMaterials/fetchAll",
       async()=>{
        const data = await getAllLearningMaterials();
        return data
       })

// Define the state for learning materials
 interface LearningMaterialState  {
    materials:LearningMaterial[],
    loading:boolean,
    error:string | null
}

// Set the initial state
const initialState : LearningMaterialState = {
    materials:[],
    loading:false,
    error:null
}

// Create learning material slice
const learningMaterialSlice = createSlice({
    name: 'learningMaterials',
    initialState,
    reducers:{},
    // Handle the different state of fetch materials
    extraReducers:(builder)=>{
      builder
           // When the request starts
          .addCase(fetchLearningMaterials.pending,(state)=>{
            state.loading = true;
            state.error = null
          })
          // When the materials are fetched successfully
          .addCase(fetchLearningMaterials.fulfilled,(state,action)=>{
            state.loading = false;
            state.materials = action.payload;
            state.error = null
          })
          // When the request fails
          .addCase(fetchLearningMaterials.rejected,(state)=>{
            state.loading = false;
            state.error = "Failed to fetch learning materials"
          })
    }
})

// Export the reducer for the redux store
export default learningMaterialSlice.reducer