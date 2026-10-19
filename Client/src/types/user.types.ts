export interface User{
    id:string;
    name: string;
    email: string;
    profileImage?:string;
    totalPoints: number;
    currentStreak: number;
    bestStreak: number;
    lastLearningDate?: string;
    currentLevel: string;
    createdAt: string;
    updatedAt: string;
}
