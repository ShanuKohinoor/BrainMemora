
import { LearningActivityModel } from "../models/learningActivity.js";
import { UserModel } from "../models/user.js";
import { RewardModel } from "../models/reward.js";
import { NotFoundError } from "../utils/error.js";

// Checks whether the user can earn reward points
export const checkRewardEligibility = async (
    userId: string,
    activityType: "session" | "flashcard" | "quiz",
    activityId: string
): Promise<boolean> => {

    const rewardEligibilityDate = new Date();
    rewardEligibilityDate.setDate(rewardEligibilityDate.getDate() - 5);

    const recentReward = await LearningActivityModel.findOne({
        userId,
        activityType,
        activityId,
        isRewardEligible: true,
        activityDate: { $gte: rewardEligibilityDate }
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

    // Check whether the user can earn reward points
    const canEarnPoints = isRewardEligible
        ? await checkRewardEligibility(userId, activityType, activityId)
        : false;

    // Save the completed activity
    const activity = await LearningActivityModel.create({
        userId,
        activityType,
        activityId,
        activityDate: new Date(),
        isRewardEligible: canEarnPoints,
        pointsAwarded: 0
    });

    // Calculate individual reward points
    let totalPoints = canEarnPoints ? points : 0;

    // Check whether this activity reaches a milestone
    let achievement = { points: 0, achievementCount: null as number | null };

    if (canEarnPoints) {
        achievement = await calculateAchievementReward(userId, activityType);
    }

    if (achievement.achievementCount !== null) {
        activity.rewardedAchievements = [
            ...(activity.rewardedAchievements ?? []),
            achievement.achievementCount
        ];

        await RewardModel.create({
            userId,
            achievementId: `${activityType}_${achievement.achievementCount}`,
            title: `${achievement.achievementCount} ${activityType} milestone`,
            description: `Completed ${achievement.achievementCount} ${activityType} activities`,
            type: activityType === "session" ? "learningSession" : activityType,
            points: achievement.points
        });

        totalPoints += achievement.points;
    }

    // Save the total points awarded for this activity
    activity.pointsAwarded = totalPoints;
    await activity.save();

    // Add the earned points to the user's account
    await awardPoints(userId, totalPoints);

    // Update the user's learning streak for every completed activity
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

    // Get today's date at midnight (UTC)
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const lastLearningDate = user.lastLearningDate
        ? new Date(user.lastLearningDate)
        : null;

    if (lastLearningDate) {
        lastLearningDate.setUTCHours(0, 0, 0, 0);
    }

    // Calculate the current streak
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

    // Update the best streak
    user.bestStreak = Math.max(
        user.bestStreak,
        user.currentStreak
    );

    user.lastLearningDate = new Date();

    await user.save();

    // Check whether the user has reached a streak milestone
    const achievement = rewardMilestones.streak.find(
        milestone => milestone.count === user.currentStreak
    );

    if (!achievement) {
        return;
    }

    // Check whether this streak milestone was already rewarded
    const achievementId = `streak_${achievement.count}`;

    const existingReward = await RewardModel.findOne({
        userId,
        achievementId
    });

    if (existingReward) {
        return;
    }

    // Save the streak reward
    await RewardModel.create({
        userId,
        achievementId,
        title: `${achievement.count}-Day Learning Streak`,
        description: `Maintained a learning streak for ${achievement.count} days`,
        type: "streak",
        points: achievement.points
    });

    // Add the streak points to the user's total
    await awardPoints(userId, achievement.points);
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


// Counts the user's unique completed activities
export const getCompletedActivityCount = async (
    userId: string,
    activityType: "session" | "flashcard" | "quiz"
): Promise<number> => {

    const completedActivities = await LearningActivityModel.distinct(
        "activityId",
        {
            userId,
            activityType,
            isRewardEligible: true
        }
    );

    return completedActivities.length;
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
