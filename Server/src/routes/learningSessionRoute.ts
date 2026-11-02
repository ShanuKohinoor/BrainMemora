import express from "express";
import { verifyUser } from "../middlewares/verifyUser.js";
import { createLearningSessions,getLearningSession,getOneLearningSession  } from "../controllers/learningSessionController.js";


const router = express.Router()


// Create learning sessions
router.post('/learningSession',verifyUser,createLearningSessions )
// Get learning sessions
router.get("/learningSession", verifyUser, getLearningSession);

router.get("/onelearningSession", verifyUser, getOneLearningSession);




export default router;