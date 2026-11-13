
import mongoose from "mongoose";
import type { StudyRoom } from "../types/studyRoom.types.js";

const studyRoomSchema = new mongoose.Schema<StudyRoom>({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    ownerId: {
        type: String,
        required: true
    },
    members: {
        type: [String],
        required: true,
        default: []
    },
    inviteCode: {
        type: String,
        required: true,
        unique: true
    },
    sharedMaterials: {
        type: [String],
        default: []
    },
    sharedQuizzes: {
        type: [String],
        default: []
    },
    sharedFlashcards: {
        type: [String],
        default: []
    },
    sharedLearningSessions: {
        type: [String],
        default: []
    }
}, { timestamps: true });

export const StudyRoomModel = mongoose.model<StudyRoom>(
    "StudyRoom",
    studyRoomSchema
);
