export interface User{
    id:string;
    name: string;
    email: string;
    password: string;
    profileImage?:string;
    totalPoints: number;
    currentStreak: number;
    bestStreak: number;
    lastLearningDate?: Date;
    currentLevel: string;
    createdAt: Date;
    updatedAt: Date
}
