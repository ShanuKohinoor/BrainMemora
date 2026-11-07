import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type User ={
    name: string;
    email:string;
}

type AuthState = {
    user: User | null;
    isLoggedIn: boolean;
    isAuthChecking:boolean;

}

type LoginPayload = {
    user:User;
}
const initialState : AuthState={
    user: null,
    isLoggedIn: false,
    isAuthChecking:true
}

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers:{
        login:(state,action: PayloadAction<LoginPayload>)=>{
            state.user=action.payload.user;
            state.isLoggedIn= true;
            state.isAuthChecking = false;
        },
        setAuthChecking: (state, action: PayloadAction<boolean>) => {
            state.isAuthChecking = action.payload;
        },
        logout:(state)=>{
            state.user = null;
            state.isLoggedIn = false;
            state.isAuthChecking = false;
        }
    }

})

export const {login,setAuthChecking,logout} = authSlice.actions;

export default authSlice.reducer