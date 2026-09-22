interface LearningMaterial{
    id: string;
    userId:string;
    title:string;
    type:string;
    description?: string;
    fileUrl?: string;
    externalUrl?: string;
    topic:string;
    tags?:string[];
    isPinned:boolean;
    createdAt:Date;
    updatedAt:Date
}

