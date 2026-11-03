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


// Get all learning sessions
export const getLearningSessions = async(
    topic:string
)=>{
    const response = await api.get('/api/session/learningSession',{
        params:{topic}
    })
    return response.data.data;
}



// Get one learning session with its quizzes and flashcards
export const getOneLearningSession = async (sessionId: string) => {
    const response = await api.get(
        `/api/session/learningSession/${sessionId}`
    );

    return response.data.data;
};