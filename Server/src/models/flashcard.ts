import mongoose from "mongoose";
import type{ FlashcardSource,Flashcard } from "../types/flashcard.types.js";


// Define the structure of a learning material linked to a flashcard
const flashcardSourceSchema = new mongoose.Schema<FlashcardSource>({
      sourceId:{
        type:String,
        required:true
      },
      sourceType:{
        type:String,
        enum:["learningMaterial","note"],
        required:true
      }
    },
      {_id:false}               // Prevents Mongoose from generating a separate _id for each source subdocument.
)

// Define the structure of flashcard document
const flashcardSchema = new mongoose.Schema<Flashcard>({
    userId:{
        type:String,
        required:true
    },
    topic:{
        type:String,
        required:true
    },
    title:{
        type:String
    },
    // Stores the learning materials linked to this flashcard.
    sources:{
        type:[flashcardSourceSchema],
        required:true
    },
    difficultyLevel:{
        type:String,
        enum:["easy","medium","hard"],
        required:true
    },
    tags:{
        type:[String]
    },
    question:{
        type: String,
        required:true
    },
    answer:{
        type:String
    }
    
    
},{timestamps:true})

export const flashcardModel = mongoose.model("Flashcard",flashcardSchema)