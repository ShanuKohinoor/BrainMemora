export interface NoteHighlight {
  text: string;
  color: string;
}




export interface Note{
    userId:string;
    title:string;
    topic:string;
    content:string;
    tags?:string[];
    highlights?:NoteHighlight[];
    isPinned:boolean;
    audioUrl?:string;
    createdAt:string;
    updatedAt:string;
}
