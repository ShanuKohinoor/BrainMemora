
import { api } from "./api";

// Get user's rewards and learning progress
export const getRewards = async () => {
    const response = await api.get(
        "/api/gamification/rewards"
    );

    return response.data.data;
};
