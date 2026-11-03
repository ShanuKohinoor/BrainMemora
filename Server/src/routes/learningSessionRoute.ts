import express from "express";
import { verifyUser } from "../middlewares/verifyUser.js";
import { createLearningSessions,getLearningSession,getOneLearningSession  } from "../controllers/learningSessionController.js";


const router = express.Router()


// Create learning sessions
router.post('/learningSession',verifyUser,createLearningSessions )

// Get all learning sessions for a topic
router.get("/learningSession", verifyUser, getLearningSession);

// Get one learning session using its ID
router.get("/learningSession/:id", verifyUser, getOneLearningSession);




export default router;