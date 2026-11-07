export interface Reward {
    _id: string;
    title: string;
    description: string;
    type: "quiz" | "flashcard" | "learningSession" | "streak";
    points: number;
    achievementId: string;
    earnedAt: string;
}

export interface RewardData {
    totalPoints: number;
    currentLevel: string;
    currentStreak: number;
    bestStreak: number;
    rewards: Reward[];
    completedActivities: {
        sessions: number;
        flashcards: number;
        quizzes: number;
    };
}