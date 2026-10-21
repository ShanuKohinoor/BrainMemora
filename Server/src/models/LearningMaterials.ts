import type { LearningMaterial } from "../types/learningMaterial.types.js";
import mongoose from "mongoose";



const learningMaterialSchema = new mongoose.Schema<LearningMaterial>({
      userId:{
        type:String,
        required:true
      },
      title:{
        type:String,
        required: true
      },
      topic:{
        type:String,
        required: true
      },
      description:{
        type:String
      },
      type:{
        type:String,
        enum: ["pdf","audio","video","image","article","url"],
        required:true
      },
      fileUrl:{                          // Temporary s3 url
        type: String,
      },
      fileKey:{                         // Idenfies the actual s3 file
      type: String
      },

      externalUrl:{                    // External wesite url
        type:String
      },
      tags:{
        type:[String]
      },
      isPinned:{
        type:Boolean,
        default:false
      }

},{timestamps:true}
)



export const learningMaterialModel = mongoose.model<LearningMaterial>("LearningMaterial",learningMaterialSchema)