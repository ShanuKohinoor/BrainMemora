
import express from "express";
import {
    createStudyRoom,
    getMyStudyRooms,
    getOneStudyRoom,
    updateStudyRoom,
    joinStudyRoom,
    leaveStudyRoom,
    removeStudyRoomMember,
    deleteStudyRoom
} from "../controllers/studyRoom.js";

import { verifyUser } from "../middlewares/verifyUser.js";

const studyRoomRouter = express.Router();

// All Study Room routes require authentication
studyRoomRouter.use(verifyUser);

// Create a new room
studyRoomRouter.post("/create", createStudyRoom);

// Get all rooms of the logged-in user
studyRoomRouter.get("/myRooms", getMyStudyRooms);

// Join a room using invitation code
studyRoomRouter.post("/join", joinStudyRoom);

// Get one room
studyRoomRouter.get("/:id", getOneStudyRoom);

// Update room details
studyRoomRouter.put("/:id", updateStudyRoom);

// Leave a room
studyRoomRouter.delete("/:id/leave", leaveStudyRoom);

// Remove a member (owner only)
studyRoomRouter.delete("/:id/members/:memberId", removeStudyRoomMember);

// Delete a room (owner only)
studyRoomRouter.delete("/:id", deleteStudyRoom);

export default studyRoomRouter;
