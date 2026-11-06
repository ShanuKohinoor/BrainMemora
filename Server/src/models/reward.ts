import mongoose from "mongoose";
import type { Reward } from "../types/reward.types.js";

const rewardSchema = new mongoose.Schema<Reward>(
    {
        userId: {
            type: String,
            required: true
        },
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        type: {
            type: String,
            enum: ["quiz", "flashcard", "learningSession", "streak"],
            required: true
        },
        points: {
            type: Number,
            required: true,
            min: 0
        },
        achievementId: {
            type: String,
            required: true
        },
        earnedAt: {
            type: Date,
            default: Date.now
        }
    },
    { timestamps: true }
);

// Prevent the same achievement from being awarded twice to one user
rewardSchema.index(
    { userId: 1, achievementId: 1 },
    { unique: true }
);



export const RewardModel = mongoose.model<Reward>(
    "Reward",
    rewardSchema
);