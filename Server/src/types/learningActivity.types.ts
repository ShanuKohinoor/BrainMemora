export interface LearningActivity {
    userId: string;
    activityType: "session" | "flashcard" | "quiz";
    activityId: string;
    activityDate: Date;
    isRewardEligible: boolean;            //Whether it qualifies for activity reward points
    rewardedAchievements?: number[];
    pointsAwarded: number;
    createdAt: Date;
    updatedAt: Date;
}