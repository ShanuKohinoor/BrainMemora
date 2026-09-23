import express from "express"
import healthChecker from "./routes/healthCheck.js"
import cors from "cors"
import helmet from "helmet";
import { errorHandlingMiddleware } from "./middlewares/errorHandling.js";
import authRoute from "./routes/authRoute.js"

const app = express()

// Enable CORS. So the frontend can communicate with the backend
app.use(cors())

// Enable security-related HTTP headers
app.use(helmet());

// Enable JSON data
app.use(express.json())

// Connect the health-check route
app.use("/api",healthChecker)

// Connect authentication route
app.use("/api/auth",authRoute)

// Connect ErrorHandling Middleware
app.use(errorHandlingMiddleware)


export default app