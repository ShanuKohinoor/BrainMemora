import { createSlice } from "@reduxjs/toolkit";


// Define the search state type
type SearchState = {
    search:string;
}

// Set the initial search text to empty
const initialState:SearchState ={
    search:""
}

// Create a Redux slice for navbar search
const searchSlice = createSlice({
    name: "search",
    initialState,
    reducers:{
        // Update the search text
        setSearch(state,action){
            state.search = action.payload
        }
    }
})

// Export the action
export const {setSearch} = searchSlice.actions

// Export the reducer
export default searchSlice.reducer