
import type { Request, Response } from "express";
import { UnauthorizedError } from "../utils/error.js";
import { UserModel } from "../models/user.js";
import { RewardModel } from "../models/reward.js";
import { LearningActivityModel } from "../models/learningActivity.js";

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
const [user, rewards, completedActivities] = await Promise.all([
    UserModel.findById(userId).select(
        "totalPoints currentLevel currentStreak bestStreak"
    ),

    RewardModel.find({ userId }).sort({
        earnedAt: -1
    }),

    LearningActivityModel.aggregate([
        {
            $match: {
                userId,
                isRewardEligible: true
            }
        },
        {
            $group: {
                _id: "$activityType",
                count: { $sum: 1 }
            }
        }
    ])
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
            rewards,
                completedActivities: {
        sessions: completedActivities.find(
            activity => activity._id === "session"
        )?.count ?? 0,

        flashcards: completedActivities.find(
            activity => activity._id === "flashcard"
        )?.count ?? 0,

        quizzes: completedActivities.find(
            activity => activity._id === "quiz"
        )?.count ?? 0
    }

        }
    });
};
