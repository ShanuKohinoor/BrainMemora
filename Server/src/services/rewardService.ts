
import { UserModel } from "../models/user.js";
import { RewardModel } from "../models/reward.js";
import { LearningActivityModel } from "../models/learningActivity.js";


// Calculate user learning level based on total points
export const calculateLearningLevel = (totalPoints: number): string => {
    if (totalPoints >= 1000) {
        return "Diamond";
    } else if (totalPoints >= 500) {
        return "Platinum";
    } else if (totalPoints >= 200) {
        return "Gold";
    } else if (totalPoints >= 100) {
        return "Silver";
    } else if (totalPoints >= 50) {
        return "Bronze";
    } else {
        return "Beginner";
    }
};


// Add points to the user's account
export const updateUserPoints = async (
    userId: string,
    points: number
) => {
    const user = await UserModel.findById(userId);

    if (!user) {
        throw new Error("User not found");
    }

    user.totalPoints += points;
    user.currentLevel = calculateLearningLevel(user.totalPoints);

    await user.save();

    return {
        totalPoints: user.totalPoints,
        currentLevel: user.currentLevel
    };
};


// Award achievement reward to the user
export const awardAchievementReward = async (
    userId: string,
    achievementId: string,
    title: string,
    description: string,
    type: "quiz" | "flashcard" | "learningSession" | "streak",
    points: number
) => {
    // Check whether this milestone reward already exists
    const existingReward = await RewardModel.findOne({
        userId,
        achievementId
    });

    if (existingReward) {
        return null;
    }

    // Save the reward record
    const reward = await RewardModel.create({
        userId,
        achievementId,
        title,
        description,
        type,
        points
    });

    // Add reward points to the user's account
    await updateUserPoints(userId, points);

    return reward;
};


// Check activity count and award milestone rewards
export const checkAndAwardActivityRewards = async (
    userId: string,
    activityType: "session" | "flashcard" | "quiz"
) => {

    // Count completed activities eligible for rewards
    const activityCount = await LearningActivityModel.countDocuments({
        userId,
        activityType,
        isRewardEligible: true
    });

    // Get the milestones based on activity type
    let milestones;

    if (activityType === "session") {
        milestones = [
            { requiredCount: 1, points: 5 },
            { requiredCount: 3, points: 10 },
            { requiredCount: 5, points: 15 },
            { requiredCount: 10, points: 25 }
        ];
    } else if (activityType === "flashcard") {
        milestones = [
            { requiredCount: 5, points: 5 },
            { requiredCount: 10, points: 15 },
            { requiredCount: 15, points: 20 }
        ];
    } else {
        milestones = [
            { requiredCount: 5, points: 5 },
            { requiredCount: 10, points: 15 },
            { requiredCount: 20, points: 25 }
        ];
    }

    const awardedRewards = [];

    // Check each milestone
    for (const milestone of milestones) {

        if (activityCount >= milestone.requiredCount) {

            const achievementId = `${activityType}_${milestone.requiredCount}`;

            const reward = await awardAchievementReward(
                userId,
                achievementId,
                `${milestone.requiredCount} ${activityType} milestone`,
                `Completed ${milestone.requiredCount} ${activityType} activities`,
                activityType === "session" ? "learningSession" : activityType,
                milestone.points
            );

            if (reward) {
                awardedRewards.push(reward);
            }
        }
    }

    return awardedRewards;
};


// Check streak and award milestone rewards
export const checkAndAwardStreakRewards = async (
    userId: string,
    currentStreak: number
) => {

    const milestones = [
        { requiredCount: 7, points: 10 },
        { requiredCount: 14, points: 15 },
        { requiredCount: 20, points: 20 }
    ];

    const awardedRewards = [];

    for (const milestone of milestones) {

        if (currentStreak >= milestone.requiredCount) {

            const reward = await awardAchievementReward(
                userId,
                `streak_${milestone.requiredCount}`,
                `${milestone.requiredCount}-Day Streak`,
                `Maintained a ${milestone.requiredCount}-day learning streak`,
                "streak",
                milestone.points
            );

            if (reward) {
                awardedRewards.push(reward);
            }
        }
    }

    return awardedRewards;
};
