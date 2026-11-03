
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
        default:[]
    },
    passedQuizIds:{
        type:[String],
        default:[]
    },
    flashcardIds:{
        type:[String],
        default:[]
    },
    quizCompleted:{               // Tracks quiz completion
        type:Boolean,
        default:false
    },
    flashcardCompleted:{         // Tracks flashcard completion
        type:Boolean,
        default:false
    },
    completedAt: {                 // Stores the completion date
        type: Date
    },
    isUnlocked:{
        type:Boolean,
        default:false
    },
    isCompleted:{                // Tracks overall session completion
        type:Boolean,
        default:false
    }
},{timestamps:true})


export const LearningSessionModel = mongoose.model<LearningSession>('learningSession',learningSessionSchema)


