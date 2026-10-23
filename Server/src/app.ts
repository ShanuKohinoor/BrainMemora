import express from "express"
import healthChecker from "./routes/healthCheck.js"
import cors from "cors"
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { errorHandlingMiddleware } from "./middlewares/errorHandling.js";
import authRoute from "./routes/authRoute.js"
import userRoute from "./routes/userRoute.js"
import learningMaterialRoute from "./routes/learningMaterialRoute.js"
import noteRoute from "./routes/noteRoute.js"
import cloudRoute from "./routes/cloudRoute.js"
import teachBackRoute from "./routes/teachBack.js"
import flashcardRoute from "./routes/flashcardRoute.js"
import quizRoute from "./routes/quizRoute.js"
import rateLimit from "express-rate-limit"


const app = express()

// Enable CORS. So the frontend can communicate with the backend
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true
  })
);

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

// Connect LearningMaterial route
app.use("/api/material",learningMaterialRoute)

//Connect Note route
app.use("/api/note",noteRoute)

//Connect upload in cloud route
app.use("/api/upload",cloudRoute)

//Connect teachBack route
app.use("/api/teachBack",teachBackRoute)


// Connect Flashcard route
app.use("/api/flashcard",flashcardRoute)

// Connect Quiz route
app.use("/api/quiz",quizRoute)

// Connect ErrorHandling Middleware
app.use(errorHandlingMiddleware)


export default app