interface Note{
    id:string;
    userId:string;
    title:string;
    topic:string;
    content:string;
    tags?:string[];
    highlights?:any[];
    isPinned:boolean;
    audioUrl?:string
    createdAt:Date;
    updatedAt:Date;
}
