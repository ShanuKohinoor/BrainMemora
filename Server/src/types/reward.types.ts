
export interface Reward {
    _id: string;
    userId: string;
    title: string;
    description: string;
    type: "quiz" | "flashcard" | "learningSession" | "streak";
    points: number;
    achievementId: string;
    earnedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
