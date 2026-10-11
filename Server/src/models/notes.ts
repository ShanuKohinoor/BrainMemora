import mongoose from "mongoose"

import type{Note} from "../types/note.types.js"



const noteSchema = new mongoose.Schema<Note>({
    userId:{
        type:String,
        required:true
    },
    title:{
        type:String,
        required:true
    },
    topic:{
        type:String,
        required:true
    },
    tags:{
        type:[String]
    },
    content:{
        type:String,
        required:true
    },
    isPinned:{
        type:Boolean,
        default:false
    },
    highlights:{
        type:[mongoose.Schema.Types.Mixed],
        default:[]
    },    
    audioUrl:{
        type:String,
    }
},{timestamps:true})

export const noteModel = mongoose.model<Note>("Note",noteSchema)