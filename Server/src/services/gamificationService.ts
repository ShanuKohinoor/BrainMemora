
import { LearningActivityModel } from "../models/learningActivity.js";
import { UserModel } from "../models/user.js";
import { NotFoundError } from "../utils/error.js";

// Checks whether the user can earn reward points
export const checkRewardEligibility = async (
    userId: string,
    activityType: "session" | "flashcard" | "quiz",
    activityId: string
): Promise<boolean> => {

    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

    const recentReward = await LearningActivityModel.findOne({
        userId,
        activityType,
        activityId,
        isRewardEligible: true,
        activityDate: { $gte: tenDaysAgo }
    });

    return !recentReward;
};


// Saves the completed activity and awards earned points
export const recordLearningActivity = async (
    userId: string,
    activityType: "session" | "flashcard" | "quiz",
    activityId: string,
    isRewardEligible: boolean,
    points: number
): Promise<void> => {

    // Save the completed activity
    const activity = await LearningActivityModel.create({
        userId,
        activityType,
        activityId,
        activityDate: new Date(),
        isRewardEligible,
        pointsAwarded: 0
    });

    // Calculate individual reward points
    let totalPoints = isRewardEligible ? points : 0;

    // Check whether this activity reaches a milestone
    const achievement = await calculateAchievementReward(
        userId,
        activityType
    );

    if (achievement.achievementCount !== null) {
        // Save the milestone to prevent duplicate rewards
        activity.rewardedAchievements = [
            ...(activity.rewardedAchievements ?? []),
            achievement.achievementCount
        ];

        totalPoints += achievement.points;
    }

    // Save the total points awarded for this activity
    activity.pointsAwarded = totalPoints;
    await activity.save();

    // Add the earned points to the user's account
    await awardPoints(userId, totalPoints);

    // Update the user's learning streak
   await updateLearningStreak(userId);
};


// Updates the user's current and best streaks
export const updateLearningStreak = async (
    userId: string
): Promise<void> => {

    const user = await UserModel.findById(userId);

    if (!user) {
        throw new NotFoundError("User not found");
    }

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const lastLearningDate = user.lastLearningDate
        ? new Date(user.lastLearningDate)
        : null;

    if (lastLearningDate) {
        lastLearningDate.setUTCHours(0, 0, 0, 0);
    }

    if (!lastLearningDate) {
        user.currentStreak = 1;
    } else {
        const differenceInDays = Math.floor(
            (today.getTime() - lastLearningDate.getTime()) /
            (1000 * 60 * 60 * 24)
        );

        if (differenceInDays === 0) {
            // Already learned today
            return;
        } else if (differenceInDays === 1) {
            // Continue the streak
            user.currentStreak += 1;
        } else {
            // Restart the streak
            user.currentStreak = 1;
        }
    }

    user.bestStreak = Math.max(
        user.bestStreak,
        user.currentStreak
    );

    user.lastLearningDate = new Date();

    await user.save();
};


// Adds earned points and updates the user's level
export const awardPoints = async (
    userId: string,
    points: number
): Promise<void> => {

    if (points <= 0) {
        return;
    }

    const user = await UserModel.findById(userId);

    if (!user) {
        throw new NotFoundError("User not found");
    }

    // Add points to the user's total
    user.totalPoints += points;

    // Update the user's level
    if (user.totalPoints >= 1000) {
        user.currentLevel = "Diamond";
    } else if (user.totalPoints >= 500) {
        user.currentLevel = "Platinum";
    } else if (user.totalPoints >= 200) {
        user.currentLevel = "Gold";
    } else if (user.totalPoints >= 100) {
        user.currentLevel = "Silver";
    } else if (user.totalPoints >= 50) {
        user.currentLevel = "Bronze";
    } else {
        user.currentLevel = "Beginner";
    }

    await user.save();
};


// Points awarded when the user reaches these milestones
export const rewardMilestones = {
    session: [
        { count: 1, points: 5 },
        { count: 3, points: 10 },
        { count: 5, points: 15 },
        { count: 10, points: 25 }
    ],

    flashcard: [
        { count: 5, points: 5 },
        { count: 10, points: 15 },
        { count: 15, points: 20 }
    ],

    quiz: [
        { count: 5, points: 5 },
        { count: 10, points: 15 },
        { count: 20, points: 25 }
    ],

    streak: [
        { count: 7, points: 10 },
        { count: 14, points: 15 },
        { count: 20, points: 20 }
    ]
};


// Counts the user's completed activities
export const getCompletedActivityCount = async (
    userId: string,
    activityType: "session" | "flashcard" | "quiz"
): Promise<number> => {

    const completedCount = await LearningActivityModel.countDocuments({
        userId,
        activityType
    });

    return completedCount;
};


// Checks whether an achievement has already been rewarded
export const hasAchievementBeenRewarded = async (
    userId: string,
    activityType: "session" | "flashcard" | "quiz",
    achievementCount: number
): Promise<boolean> => {

    const existingAchievement = await LearningActivityModel.findOne({
        userId,
        activityType,
        rewardedAchievements: achievementCount
    });

    return !!existingAchievement;
};


// Calculates the points for a newly reached achievement
export const calculateAchievementReward = async (
    userId: string,
    activityType: "session" | "flashcard" | "quiz"
): Promise<{ points: number; achievementCount: number | null }> => {

    const completedCount = await getCompletedActivityCount(
        userId,
        activityType
    );

    const achievement = rewardMilestones[activityType].find(
        milestone => milestone.count === completedCount
    );

    if (!achievement) {
        return {
            points: 0,
            achievementCount: null
        };
    }

    const alreadyRewarded = await hasAchievementBeenRewarded(
        userId,
        activityType,
        achievement.count
    );

    if (alreadyRewarded) {
        return {
            points: 0,
            achievementCount: null
        };
    }

    return {
        points: achievement.points,
        achievementCount: achievement.count
    };
};
