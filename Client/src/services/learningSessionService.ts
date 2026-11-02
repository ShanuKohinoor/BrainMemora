import {api} from "./api"


// Create learning material
export const createLearningSessions = async(
    topic:string,
)=>{
     const response = await api.post('/api/session/learningSession',{
        topic
     })
     return response.data
}


// Get learning material
export const getLearningSessions = async(
    topic:string
)=>{
    const response = await api.get('/api/session/learningSession',{
        params:{topic}
    })
    return response.data.data;
}