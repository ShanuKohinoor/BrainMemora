export interface TeachBack{
    id:string;
    userId:string;
    topic:string;
    title?:string;
    sessionId?:string;
    audioUrl:string;
    audioKey:string;
    duration?:number;
    createdAt:Date;
    updatedAt:Date;
}
