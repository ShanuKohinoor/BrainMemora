
import type { Request, Response } from "express";
import { UnauthorizedError } from "../utils/error.js";
import { UserModel } from "../models/user.js";
import { RewardModel } from "../models/reward.js";

// Get user's rewards and progress
export const getRewards = async (
    req: Request,
    res: Response
) => {

    if (!req.userId) {
        throw new UnauthorizedError("Please login first");
    }

    const userId = req.userId;

    // Fetch user details and earned rewards
    const [user, rewards] = await Promise.all([
        UserModel.findById(userId).select(
            "totalPoints currentLevel currentStreak bestStreak"
        ),

        RewardModel.find({ userId }).sort({
            earnedAt: -1
        })
    ]);

    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found"
        });
    }

    return res.status(200).json({
        success: true,
        message: "Rewards fetched successfully",
        data: {
            totalPoints: user.totalPoints,
            currentLevel: user.currentLevel,
            currentStreak: user.currentStreak,
            bestStreak: user.bestStreak,
            rewards
        }
    });
};
