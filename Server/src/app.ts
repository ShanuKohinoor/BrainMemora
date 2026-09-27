import express from "express"
import healthChecker from "./routes/healthCheck.js"
import cors from "cors"
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { errorHandlingMiddleware } from "./middlewares/errorHandling.js";
import authRoute from "./routes/authRoute.js"
import userRoute from "./routes/userRoute.js"
import rateLimit from "express-rate-limit"

const app = express()

// Enable CORS. So the frontend can communicate with the backend
app.use(cors())

// Enable security-related HTTP headers
app.use(helmet());

// Enable JSON data
app.use(express.json())

// Enable cookieparser 
app.use(cookieParser())

// Create rate limiter
const Limiter = rateLimit({
    // Set 15 minutes time window
    windowMs: 15*60*1000,

    // Allow maximum 100 requests in 15 minutes in that window
    limit:100
})
// Apply rate limiter to all routes
app.use(Limiter)

// Connect the health-check route
app.use("/api",healthChecker)

// Connect authentication route
app.use("/api/auth",authRoute)

//Connect User route
app.use("/api/user",userRoute)
// Connect ErrorHandling Middleware
app.use(errorHandlingMiddleware)


export default app