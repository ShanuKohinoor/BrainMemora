
import mongoose from "mongoose";
import type { LearningSession } from "../types/learningSession.types.js";


const learningSessionSchema = new mongoose.Schema<LearningSession>({
    userId:{
        type:String,
        required:true
    },
    topic:{
        type:String,
        required:true
    },
    title:{
        type:String,
        required:true
    },
    description:{
        type:String
    },
    order:{
        type:Number,
        required:true
    },
    quizIds:{
        type: [String],
        default: []
    },
    flashcardIds:{
        type:[String],
        default:[]
    },
    quizCompleted:{
        type:Boolean,
        default:false
    },
    flashcardCompleted:{
        type:Boolean,
        default:false
    },

    isUnlocked:{
        type:Boolean,
        required:true
    },
    isCompleted:{
        type:Boolean,
        required:true
    }
},{timestamps:true})


export const LearningSessionModel = mongoose.model<LearningSession>('learningSession',learningSessionSchema)


