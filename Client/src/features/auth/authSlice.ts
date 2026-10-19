import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type User ={
    name: string;
    email:string;
}

type AuthState = {
    user: User | null;
    isLoggedIn: boolean;
}

type LoginPayload = {
    user:User;
}
const initialState : AuthState={
    user: null,
    isLoggedIn: false,

}

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers:{
        login:(state,action: PayloadAction<LoginPayload>)=>{
            state.user=action.payload.user;
            state.isLoggedIn= true;
        },
        logout:(state)=>{
            state.user = null;
            state.isLoggedIn = false;
        }
    }

})

export const {login,logout} = authSlice.actions;

export default authSlice.reducer