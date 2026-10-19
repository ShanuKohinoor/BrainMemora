// Import configureStore from Redux Toolkit.
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice"
import learningMaterialReducer from "../features/learningMaterials/learningMaterialSlice"

// Create the Redux store
export const store = configureStore({
    reducer:{
       auth:authReducer,
       learningMaterials: learningMaterialReducer
    }
})

// Create a TypeScript type for the complete Redux state.
export type RootState = ReturnType<typeof store.getState>


// Create a TypeScript type for the stores dispatch function.
export type AppDispatch = typeof store.dispatch
