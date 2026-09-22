import mongoose from "mongoose";
import type { User } from "../types/user.types.js";




const userSchema = new mongoose.Schema<User>({
    name: {
        type: String,
        required:true
    },
    email:{
        type: String,
        required:true,
        unique:true
    },
    password:{
        type: String,
        required:true
    },
    currentStreak:{
        type: Number,
        default:0
    },
    currentLevel:{
        type: String,
        default:"Beginner"
    },
    bestStreak:{
        type: Number,
        default:0
    },
    totalPoints: {
        type: Number,
        default: 0
    },
    lastLearningDate:{
        type: Date,
    },
    profileImage:{
    type: String,
    }
},
{ timestamps:true }
)


export const UserModel = mongoose.model<User>("User",userSchema)