
import { Router } from "express";
import {
    generateAIContent,
    generatePromptAI,
    getAIHistory
} from "../controllers/aiController.js";
import { verifyUser } from "../middlewares/verifyUser.js";

const aiRouter = Router();

// Generate content from the user's saved learning materials
aiRouter.post("/generate", verifyUser, generateAIContent);

// Generate content from the user's own prompt
aiRouter.post("/prompt", verifyUser, generatePromptAI);

// Retrieve the user's AI generation history
aiRouter.get("/history", verifyUser, getAIHistory);

export default aiRouter;
