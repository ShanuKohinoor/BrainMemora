

import { Navigate, Outlet } from "react-router";
import { useAppSelector } from "../app/hooks";

export function ProtectedRoute() {
    // Get the login status from the Redux store
    const isLoggedIn = useAppSelector(
        (state) => state.auth.isLoggedIn
    );
    // Check whether authentication is still in progress
    const isAuthChecking = useAppSelector(
        (state) => state.auth.isAuthChecking
    );
    // Wait until authentication checking is complete
    if (isAuthChecking) {
        return <div>Checking authentication...</div>;
    }

    // If the user is not logged in, redirect to login page
    if (!isLoggedIn) {
        return <Navigate to="/login" replace />;
    }

    // If the user is logged in, display the protected pages
    return <Outlet />;
}