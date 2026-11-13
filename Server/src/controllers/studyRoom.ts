
import type { Request, Response } from "express";
import { UnauthorizedError, NotFoundError, ConflictError, BadRequest } from "../utils/error.js";
import { StudyRoomModel } from "../models/studyRoom.js";
import type { StudyRoom } from "../types/studyRoom.types.js";
import type { ApiResponse } from "../types/apiResponse.types.js";
import { randomBytes } from "node:crypto";


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
