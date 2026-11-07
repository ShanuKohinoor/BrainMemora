
import { useEffect } from "react";
import { api } from "../services/api";
import { useAppDispatch } from "../app/hooks";
import { login, logout } from "../features/auth/authSlice";

export function AuthCheck() {
    const dispatch = useAppDispatch();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await api.get("/api/auth/currentUser");

                dispatch(login({
                    user: response.data.data
                }));

            } catch (error) {
                dispatch(logout());
            }
        };

        checkAuth();
    }, [dispatch]);

    return null;
}
