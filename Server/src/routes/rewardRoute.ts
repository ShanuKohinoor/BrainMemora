
import { Router } from "express";
import { getRewards } from "../controllers/rewardController.js";
import { verifyUser } from "../middlewares/verifyUser.js";

const router = Router();

// Get logged in user's rewards
router.get("/rewards", verifyUser, getRewards);

export default router;
