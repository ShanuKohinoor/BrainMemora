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
    topic ?:string
)=>{
    const response = await api.get('/api/session/learningSession',{
        params:topic ? {topic} : {}
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


// Mark flashcards as completed in a learning session
export const completeFlashcardsSession = async (id: string) => {
    const response = await api.patch(
        `/api/session/learningSession/${id}/completeFlashcards`
    );

    return response.data.data;
};



// Delete learning session by ID
export const deleteSingleSession = async(id:string)=>{
    const response = await api.delete(
        `/api/session/deleteSession/${id}`
    )
    return response.data
}