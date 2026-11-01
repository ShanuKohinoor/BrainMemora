
import type { Request,Response } from "express"
import { UnauthorizedError } from "../utils/error.js"

import { LearningSessionModel } from "../models/learnngSession.js"


// Create Learning Session
export const createLearningSessions  = async(
  req:Request,
  res:Response
)=>{
    if(!req.userId){
        throw new UnauthorizedError("Please login first")
    }

//    const {topic,title,description,order,quizIds,flashcardIds,quizCompleted,flashcardCompleted,isUnlocked,isCompleted} = req.body;
   
    const {topic,sessions} = req.body
    const userId = req.userId;



    const newSessions = await LearningSessionModel.insertMany(
        sessions.map((session: any, index: number) => ({
            userId,
            topic,
            title: session.title,
            description: session.description,
            order: index + 1,
            quizIds: session.quizIds || [],
            flashcardIds: session.flashcardIds || [],
            quizCompleted: false,
            flashcardCompleted: false,
            isUnlocked: index === 0,
            isCompleted: false
        }))
    );

    return res.status(201).json({
        message:"Learning Session created Succcessfully",
        success:true,
        data:newSessions
    })
}