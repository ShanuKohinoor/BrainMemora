interface LearningSession{
    id:string;
    userId:string;
    topic:string;
    title:string;
    description?:string;
    order:number;
    isUnlocked:boolean;
    isCompleted:boolean
    createdAt:Date;
    updatedAt:Date;
    completedAt?:Date
}
