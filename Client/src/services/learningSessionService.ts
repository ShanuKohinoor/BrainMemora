import {api} from "./api"

import type { LearningSession } from "../types/learningSession.types"




export const createLearningSessions = async(
    topic:string,
    sessions:Partial<LearningSession>[]            // Partial:-means all properties in the LearningSession interface become optional
)=>{
     const response = await api.post('/api/session/learningSession',{
        topic,
        sessions
     })
     return response.data
}