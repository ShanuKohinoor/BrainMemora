// Allowed types of learning materials
export type MaterialType = "pdf" | "video" | "audio" | "image" |"article" | "notes"


// Complete Learning Material stored in the database
export interface LearningMaterial{
    userId:string;
    title:string;
    type:MaterialType;
    description?: string;
    fileUrl?: string;
    externalUrl?: string;
    topic:string;
    tags?:string[];
    isPinned:boolean;
    createdAt:Date;
    updatedAt:Date
}


// Data sent from the client when creating a learning material
export interface CreateLearningMaterialBody{
    title:string;
    topic:string;
    description?:string | undefined;
    type:MaterialType;
    fileUrl?:string | undefined;
    externalUrl?: string | undefined;
    tags?:string[] | undefined

}


