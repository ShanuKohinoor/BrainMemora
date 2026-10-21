import mongoose from "mongoose";
import type{ TeachBack } from "../types/teachBack.types.js";



const teachBackSchema = new mongoose.Schema<TeachBack>({
    userId:{
        type: String,
        required: true
    },
    topic:{
        type:String,
        required:true
    },
    title:{
        type:String,
        required:false
    },
    sessionId:{
        type:String
    },
    audioUrl:{
        type:String,
        required:true
    },
    audioKey:{
        type:String,       
        required:true
    },
    duration:{
        type: Number,
        required:false
    }
},{timestamps:true})

export const teachBackModel = mongoose.model<TeachBack>('TeachBack',teachBackSchema)