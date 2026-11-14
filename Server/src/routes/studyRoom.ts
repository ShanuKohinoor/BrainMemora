
import express from "express";
import {
    createStudyRoom,
    getMyStudyRooms,
    getOneStudyRoom,
    shareLearningMaterial,
    shareQuiz,
    shareFlashcards,
    shareLearningSession,
    getSharedMaterials,
    updateStudyRoom,
    joinStudyRoom,
    leaveStudyRoom,
    removeStudyRoomMember,
    deleteStudyRoom
} from "../controllers/studyRoom.js";

import { verifyUser } from "../middlewares/verifyUser.js";

const router = express.Router();


// Create a new room
router.post("/create",verifyUser, createStudyRoom);

// Get all rooms of the logged-in user
router.get("/myRooms",verifyUser, getMyStudyRooms);

// Join a room using invitation code
router.post("/join",verifyUser, joinStudyRoom);

// Get one room
router.get("/:id",verifyUser, getOneStudyRoom);

// Share learning materials
router.post("/:id/share/material", verifyUser, shareLearningMaterial);

// Share a quiz
router.post("/:id/share/quiz", verifyUser, shareQuiz);


// Share flashcards
router.post("/:id/share/flashcards", verifyUser, shareFlashcards);

// Share learning session
router.post("/:id/share/learning-session", verifyUser, shareLearningSession);

// Get shared learning materials
router.get("/:id/shared/materials", verifyUser, getSharedMaterials);

// Update room details
router.put("/:id",verifyUser, updateStudyRoom);

// Leave a room
router.delete("/:id/leave",verifyUser, leaveStudyRoom);

// Remove a member (owner only)
router.delete("/:id/members/:memberId",verifyUser, removeStudyRoomMember);

// Delete a room (owner only)
router.delete("/:id",verifyUser, deleteStudyRoom);

export default router;
