import express from "express"
import healthChecker from "./routes/healthCheck.js"
import cors from "cors"
import helmet from "helmet";

const app = express()

// Enable CORS. So the frontend can communicate with the backend
app.use(cors())

// Enable security-related HTTP headers
app.use(helmet());

// Connect the health-check route
app.use("/api",healthChecker)


export default app