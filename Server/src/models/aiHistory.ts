
import mongoose from "mongoose";

// Define the structure of one AI generation history record.
const aiHistorySchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true
        },
        mode: {
            type: String,
            enum: ["create", "prompt"],
            required: true
        },
        action: {
            type: String,
            required: true
        },
        topic: {
            type: String
        },
        title: {
            type: String
        },
        prompt: {
            type: String
        },
        content: {
            type: String,
            required: true
        }
    },
    { timestamps: true }
);

// Create and export the AI History model.
export const aiHistoryModel = mongoose.model("AIHistory", aiHistorySchema);
