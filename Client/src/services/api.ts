import axios from "axios"


// Create reusable axios instance
export const api = axios.create({                 // axios helps the frontend communicate with the backend.
    // All API requests will start with this URL
    baseURL:"http://localhost:5000",
    withCredentials:true               // allows the frontend to send and recieve authentication cookies
})