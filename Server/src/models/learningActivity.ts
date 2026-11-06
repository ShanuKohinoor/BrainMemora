import mongoose from "mongoose";
import type { LearningActivity } from "../types/learningActivity.types.js";

const learningActivitySchema = new mongoose.Schema<LearningActivity>({
    userId: {
        type: String,
        required: true
    },
    activityType: {
        type: String,
        enum: ["session", "flashcard", "quiz"],
        required: true
    },
    activityId: {
        type: String,
        required: true
    },
    activityDate: {
        type: Date,
        default: Date.now
    },
    isRewardEligible: {
        type: Boolean,
        default: false
    },
    rewardedAchievements: {
        type: [Number],
        default: []
    },
    pointsAwarded: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

export const LearningActivityModel = mongoose.model<LearningActivity>(
    "LearningActivity",
    learningActivitySchema
);