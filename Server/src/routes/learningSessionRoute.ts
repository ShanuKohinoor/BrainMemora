import express from "express";
import { verifyUser } from "../middlewares/verifyUser.js";
import { createLearningSessions  } from "../controllers/learningSessionController.js";


const router = express.Router()



router.post('/learningSession',verifyUser,createLearningSessions )



export default router;