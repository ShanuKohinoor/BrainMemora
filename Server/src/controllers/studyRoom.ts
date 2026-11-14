
import type { Request, Response } from "express";
import { UnauthorizedError, NotFoundError, ConflictError, BadRequest } from "../utils/error.js";
import { StudyRoomModel } from "../models/studyRoom.js";
import type { StudyRoom } from "../types/studyRoom.types.js";
import type { ApiResponse } from "../types/apiResponse.types.js";
import { randomBytes } from "node:crypto";
import { learningMaterialModel } from "../models/learningMaterials.js";
import { quizModel } from "../models/quiz.js";
import { flashcardModel } from "../models/flashcard.js";
import { LearningSessionModel } from "../models/learningSession.js";
import type { LearningMaterial } from "../types/learningMaterial.types.js";


// CREATE A NEW STUDY ROOM
export const createStudyRoom = async (
    req: Request<{}, {}, { name: string; description?: string }>,
    res: Response<ApiResponse<StudyRoom>>
) => {

    if (!req.userId) {
        throw new UnauthorizedError("Please login first");
    }

    const userId = req.userId;
    const { name, description } = req.body;

    if (!name?.trim()) {
        throw new BadRequest("Please enter a room name");
    }

    // Generate an invitation code
    const inviteCode = randomBytes(6).toString("hex").toUpperCase();

    // Create the room and add its creator as the first member
    const newRoom = await StudyRoomModel.create({
        name: name.trim(),
        ...(description !== undefined && { description: description.trim() }),
        ownerId: userId,
        members: [userId],
        inviteCode
    });

    return res.status(201).json({
        success: true,
        message: "Study Room created successfully",
        data: newRoom
    });
};


// GET ALL ROOMS OF THE LOGGED-IN USER
export const getMyStudyRooms = async (
    req: Request,
    res: Response<ApiResponse<StudyRoom[]>>
) => {

    if (!req.userId) {
        throw new UnauthorizedError("Please login first");
    }

    const userId = req.userId;

    // Find rooms where the user is a member
    const rooms = await StudyRoomModel.find({
        members: userId
    }).sort({ createdAt: -1 });

    return res.status(200).json({
        success: true,
        message: rooms.length === 0
            ? "No Study Rooms found"
            : "Study Rooms fetched successfully",
        data: rooms
    });
};


// GET ONE STUDY ROOM
export const getOneStudyRoom = async (
    req: Request<{ id: string }>,
    res: Response<ApiResponse<StudyRoom>>
) => {

    if (!req.userId) {
        throw new UnauthorizedError("Please login first");
    }

    const userId = req.userId;
    const { id } = req.params;

    // Only a room member can access the room
    const room = await StudyRoomModel.findOne({
        _id: id,
        members: userId
    });

    if (!room) {
        throw new NotFoundError("Study Room not found");
    }

    return res.status(200).json({
        success: true,
        message: "Study Room fetched successfully",
        data: room
    });
};


// UPDATE STUDY ROOM DETAILS
export const updateStudyRoom = async (
    req: Request<{ id: string }, {}, { name?: string; description?: string }>,
    res: Response<ApiResponse<StudyRoom>>
) => {

    if (!req.userId) {
        throw new UnauthorizedError("Please login first");
    }

    const userId = req.userId;
    const { id } = req.params;
    const { name, description } = req.body;

    if (name === undefined && description === undefined) {
        throw new BadRequest("Please provide details to update");
    }

    // Only the room owner can update room details
    const room = await StudyRoomModel.findOne({
        _id: id,
        ownerId: userId
    });

    if (!room) {
        throw new NotFoundError("Study Room not found or you are not the owner");
    }

    if (name !== undefined) {
        if (!name.trim()) {
            throw new BadRequest("Room name cannot be empty");
        }
        room.name = name.trim();
    }

    if (description !== undefined) {
        room.description = description.trim();
    }

    await room.save();

    return res.status(200).json({
        success: true,
        message: "Study Room updated successfully",
        data: room
    });
};


// JOIN A STUDY ROOM USING INVITATION CODE
export const joinStudyRoom = async (
    req: Request<{}, {}, { inviteCode: string }>,
    res: Response<ApiResponse<StudyRoom>>
) => {

    if (!req.userId) {
        throw new UnauthorizedError("Please login first");
    }

    const userId = req.userId;
    const { inviteCode } = req.body;

    if (!inviteCode?.trim()) {
        throw new BadRequest("Please enter an invitation code");
    }

    const room = await StudyRoomModel.findOne({
        inviteCode: inviteCode.trim().toUpperCase()
    });

    if (!room) {
        throw new NotFoundError("Invalid invitation code");
    }

    // Prevent the same user from joining twice
    if (room.members.includes(userId)) {
        throw new ConflictError("You are already a member of this room");
    }

    room.members.push(userId);
    await room.save();

    return res.status(200).json({
        success: true,
        message: "Joined Study Room successfully",
        data: room
    });
};


// LEAVE A STUDY ROOM
export const leaveStudyRoom = async (
    req: Request<{ id: string }>,
    res: Response<ApiResponse<null>>
) => {

    if (!req.userId) {
        throw new UnauthorizedError("Please login first");
    }

    const userId = req.userId;
    const { id } = req.params;

    const room = await StudyRoomModel.findOne({
        _id: id,
        members: userId
    });

    if (!room) {
        throw new NotFoundError("Study Room not found");
    }

    // The owner must delete or transfer ownership before leaving
    if (room.ownerId === userId) {
        throw new BadRequest("The room owner cannot leave the room. Delete the room instead.");
    }

    room.members = room.members.filter(
        (memberId) => memberId !== userId
    );

    await room.save();

    return res.status(200).json({
        success: true,
        message: "You left the Study Room successfully",
        data: null
    });
};


// REMOVE A MEMBER FROM A STUDY ROOM
export const removeStudyRoomMember = async (
    req: Request<{ id: string; memberId: string }>,
    res: Response<ApiResponse<StudyRoom>>
) => {

    if (!req.userId) {
        throw new UnauthorizedError("Please login first");
    }

    const userId = req.userId;
    const { id, memberId } = req.params;

    // Only the owner can remove members
    const room = await StudyRoomModel.findOne({
        _id: id,
        ownerId: userId
    });

    if (!room) {
        throw new NotFoundError("Study Room not found or you are not the owner");
    }

    if (memberId === room.ownerId) {
        throw new BadRequest("The room owner cannot be removed");
    }

    if (!room.members.includes(memberId)) {
        throw new NotFoundError("Member not found in this room");
    }

    room.members = room.members.filter(
        (id) => id !== memberId
    );

    await room.save();

    return res.status(200).json({
        success: true,
        message: "Member removed successfully",
        data: room
    });
};


// DELETE A STUDY ROOM
export const deleteStudyRoom = async (
    req: Request<{ id: string }>,
    res: Response<ApiResponse<null>>
) => {

    if (!req.userId) {
        throw new UnauthorizedError("Please login first");
    }

    const userId = req.userId;
    const { id } = req.params;

    // Only the owner can delete the room
    const room = await StudyRoomModel.findOne({
        _id: id,
        ownerId: userId
    });

    if (!room) {
        throw new NotFoundError("Study Room not found or you are not the owner");
    }

    await StudyRoomModel.deleteOne({
        _id: id,
        ownerId: userId
    });

    return res.status(200).json({
        success: true,
        message: "Study Room deleted successfully",
        data: null
    });
};


// SHARE A LEARNING MATERIAL WITH A STUDY ROOM
export const shareLearningMaterial = async (
    req: Request<{ id: string }, {}, { materialId: string }>,
    res: Response<ApiResponse<StudyRoom>>
) => {

    if (!req.userId) {
        throw new UnauthorizedError("Please login first");
    }

    const userId = req.userId;
    const { id } = req.params;
    const { materialId } = req.body;

    if (!materialId?.trim()) {
        throw new BadRequest("Please select a learning material");
    }

    // Check whether the logged-in user is a member of this room
    const room = await StudyRoomModel.findOne({
        _id: id,
        members: userId
    });

    if (!room) {
        throw new NotFoundError("Study Room not found");
    }

    // Find the material and verify that it belongs to the logged-in user
    const material = await learningMaterialModel.findOne({
        _id: materialId,
        userId
    });

    if (!material) {
        throw new NotFoundError("Learning material not found in your library");
    }

    // Prevent sharing the same material more than once
    if (room.sharedMaterials.includes(materialId)) {
        throw new ConflictError("This material is already shared in the room");
    }

    // Add the material ID to the room's shared materials
    room.sharedMaterials.push(materialId);

    await room.save();

    return res.status(200).json({
        success: true,
        message: "Learning material shared successfully",
        data: room
    });
};




// SHARE A QUIZ WITH A STUDY ROOM
export const shareQuiz = async (
    req: Request<{ id: string }, {}, { quizId: string }>,
    res: Response<ApiResponse<StudyRoom>>
) => {

    if (!req.userId) {
        throw new UnauthorizedError("Please login first");
    }

    const userId = req.userId;
    const { id } = req.params;
    const { quizId } = req.body;

    if (!quizId?.trim()) {
        throw new BadRequest("Please select a quiz");
    }

    // Check whether the logged-in user is a member of this room
    const room = await StudyRoomModel.findOne({
        _id: id,
        members: userId
    });

    if (!room) {
        throw new NotFoundError("Study Room not found");
    }

    // Find the quiz and verify that it belongs to the logged-in user
    const quiz = await quizModel.findOne({
        _id: quizId,
        userId
    });

    if (!quiz) {
        throw new NotFoundError("Quiz not found in your library");
    }

    // Prevent sharing the same quiz more than once
    if (room.sharedQuizzes.includes(quizId)) {
        throw new ConflictError("This quiz is already shared in the room");
    }

    // Add the quiz ID to the room's shared quizzes
    room.sharedQuizzes.push(quizId);

    await room.save();

    return res.status(200).json({
        success: true,
        message: "Quiz shared successfully",
        data: room
    });
};












// SHARE FLASHCARDS WITH A STUDY ROOM
export const shareFlashcards = async (
    req: Request<{ id: string }, {}, { flashcardId: string }>,
    res: Response<ApiResponse<StudyRoom>>
) => {

    if (!req.userId) {
        throw new UnauthorizedError("Please login first");
    }

    const userId = req.userId;
    const { id } = req.params;
    const { flashcardId } = req.body;

    if (!flashcardId?.trim()) {
        throw new BadRequest("Please select a flashcard set");
    }

    // Check whether the user is a member of this room
    const room = await StudyRoomModel.findOne({
        _id: id,
        members: userId
    });

    if (!room) {
        throw new NotFoundError("Study Room not found");
    }

    // Find the flashcard set and verify its owner
    const flashcard = await flashcardModel.findOne({
        _id: flashcardId,
        userId
    });

    if (!flashcard) {
        throw new NotFoundError("Flashcard set not found in your library");
    }

    // Prevent duplicate sharing
    if (room.sharedFlashcards.includes(flashcardId)) {
        throw new ConflictError("This flashcard set is already shared");
    }

    // Add the flashcard ID to the room
    room.sharedFlashcards.push(flashcardId);

    await room.save();

    return res.status(200).json({
        success: true,
        message: "Flashcards shared successfully",
        data: room
    });
};







// SHARE A LEARNING SESSION WITH A STUDY ROOM
export const shareLearningSession = async (
    req: Request<{ id: string }, {}, { learningSessionId: string }>,
    res: Response<ApiResponse<StudyRoom>>
) => {

    if (!req.userId) {
        throw new UnauthorizedError("Please login first");
    }

    const userId = req.userId;
    const { id } = req.params;
    const { learningSessionId } = req.body;

    if (!learningSessionId?.trim()) {
        throw new BadRequest("Please select a learning session");
    }

    // Check whether the user is a member of this room
    const room = await StudyRoomModel.findOne({
        _id: id,
        members: userId
    });

    if (!room) {
        throw new NotFoundError("Study Room not found");
    }

    // Find the learning session and verify its owner
    const learningSession = await LearningSessionModel.findOne({
        _id: learningSessionId,
        userId
    });

    if (!learningSession) {
        throw new NotFoundError("Learning session not found in your library");
    }

    // Prevent duplicate sharing
    if (room.sharedLearningSessions.includes(learningSessionId)) {
        throw new ConflictError("This learning session is already shared");
    }

    // Add the learning session ID to the room
    room.sharedLearningSessions.push(learningSessionId);

    await room.save();

    return res.status(200).json({
        success: true,
        message: "Learning session shared successfully",
        data: room
    });
};


// GET SHARED AND VIEW LEARNING MATERIALS IN A STUDY ROOM
export const getSharedMaterials = async (
    req: Request<{ id: string }>,
    res: Response<ApiResponse<LearningMaterial[]>>
) => {

    if (!req.userId) {
        throw new UnauthorizedError("Please login first");
    }

    const userId = req.userId;
    const { id } = req.params;

    // Check whether the user is a member of this room
    const room = await StudyRoomModel.findOne({
        _id: id,
        members: userId
    });

    if (!room) {
        throw new NotFoundError("Study Room not found");
    }

    // Retrieve the actual learning materials using their IDs
    const materials = await learningMaterialModel.find({
        _id: { $in: room.sharedMaterials }
    });

    return res.status(200).json({
        success: true,
        message: "Shared learning materials fetched successfully",
        data: materials
    });
};