import { Navigate,Outlet } from "react-router";
import { useSelector } from "react-redux";
import type { RootState } from "../app/store";




export function ProtectedRoute(){
      console.log("ProtectedRoute is running");

    //Get the login status from the Redux store
   const isLoggedIn = useSelector((state:RootState)=>state.auth.isLoggedIn)
   console.log("BrainMemora login status:", isLoggedIn);
  
   // If the user is not logged in,redirect to login page
    if(!isLoggedIn){
        return <Navigate to="/login" replace/>
    }
    // If the user is logged in,display the protected pages
    return (
      <Outlet/>
    )
}