 import type { Request,Response } from "express"
 import { UnauthorizedError, BadRequest } from "../utils/error.js"
 import { uploadToS3, getFileUrl } from "../services/storageServices.js"
 import { teachBackModel } from "../models/teachBack.js";
                         
                         
                         
                         // TEACHBACK CONTROLLER

 // Record voice(TeachBack)
export const createTeachBack = async (
    req: Request,
    res: Response
) => {

    if (!req.userId) {
        throw new UnauthorizedError("Please login first");
    }

    if (!req.file) {
        throw new BadRequest("Please upload an audio recording");
    }

    const { title, topic, duration, sessionId } = req.body;

    if (!topic?.trim()) {
        throw new BadRequest("Topic is required");
    }

    // Create a unique filename for this recording
    const customKey = `teachback-${Date.now()}-${req.file.originalname}`;

    // Upload the audio to S3
    const audioKey = await uploadToS3(req.file, customKey);

    // Generate a temporary playback URL
    const audioUrl = await getFileUrl(audioKey);

    // Save recording details in MongoDB
    const teachBack = await teachBackModel.create({
        userId: req.userId,
        ...(title?.trim() && { title: title.trim() }),
        topic,
        sessionId,
        audioUrl,
        audioKey,
        ...(duration !== undefined && {duration: Number(duration)})
    });

    return res.status(201).json({
        success: true,
        message: "Teach Back recording saved successfully",
        data: teachBack
    });
};




// Get recorded Teachback

export const getAllTeachBacks = async (
    req: Request,
    res: Response
) => {
    if (!req.userId) {
        throw new UnauthorizedError("Please login first");
    }

    const teachBacks = await teachBackModel.find({
        userId: req.userId
    }).sort({ createdAt: -1 });

    // Generate a fresh playback URL for each recording
    const recordings = await Promise.all(
        teachBacks.map(async (recording) => ({
            ...recording.toObject(),
            audioUrl: await getFileUrl(recording.audioKey)
        }))
    );

    return res.status(200).json({
        success: true,
        message: "Teach Back recordings fetched successfully",
        data: recordings
    });
};
