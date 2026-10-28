
import type { Request, Response } from "express";
import mongoose from "mongoose";
import { quizModel } from "../models/quiz.js";
import { learningMaterialModel } from "../models/learningMaterials.js";
import { quizGenerator } from "../utils/quizGenerator.js";
import {
  BadRequest,
  NotFoundError,
  UnauthorizedError,
} from "../utils/error.js";
import { downloadFileFromS3 } from "../services/storageServices.js";
import { extractPdfText } from "../utils/pdfExtractor.js";
import { extractImageText } from "../utils/imageTextExtractor.js";
import { transcribedMedia } from "../utils/whisperTranscriber.js";





// Generate quiz questions from selected learning materials.
export const generateQuiz = async (
  req: Request,
  res: Response
) => {
  // Check that the user is logged in.
  if (!req.userId) {
    throw new UnauthorizedError("Please login first");
  }

  const userId = req.userId;

  // Read the selected material IDs and requested question count.
  const { materialIds, numberOfQuestions = 5 } = req.body;

  // Validate the selected material IDs.
  if (
    !Array.isArray(materialIds) ||
    materialIds.length === 0 ||
    !materialIds.every(
      (id: unknown) =>
        typeof id === "string" &&
        mongoose.isValidObjectId(id)
    )
  ) {
    throw new BadRequest(
      "Please select at least one valid learning material"
    );
  }

  // Validate the requested number of questions.
  if (
    !Number.isInteger(numberOfQuestions) ||
    numberOfQuestions < 1 ||
    numberOfQuestions > 20
  ) {
    throw new BadRequest(
      "Number of questions must be between 1 and 20"
    );
  }

  // Find only materials belonging to the logged-in user.
  const materials = await learningMaterialModel.find({
    _id: { $in: materialIds },
    userId,
  });

  // Make sure every selected material was found.
  if (materials.length !== new Set(materialIds).size) {
    throw new NotFoundError(
      "One or more selected learning materials were not found"
    );
  }

  // Collect readable text from the selected materials.
  const materialTexts: string[] = [];

  for (const material of materials) {
    // Support the same file types as Flashcards.
    if (
      material.type !== "pdf" &&
      material.type !== "image" &&
      material.type !== "audio" &&
      material.type !== "video"
    ) {
      throw new BadRequest(
        `"${material.title}" is not a supported material type`
      );
    }

    // Reuse text already extracted and saved in MongoDB.
    let extractedText =
      material.extractedText?.trim() ?? "";

    // Check whether the saved text is only a PDF page marker.
    const isPageMarker =
      /^--\s*\d+\s+of\s+\d+\s+--$/i.test(extractedText);

    // Extract text again if it is missing or only a page marker.
    if (!extractedText || isPageMarker) {
      // The original uploaded file must exist in S3.
      if (!material.fileKey) {
        throw new BadRequest(
          `"${material.title}" has no uploaded file`
        );
      }

      // Download the original file from S3.
      const fileBuffer = await downloadFileFromS3(
        material.fileKey
      );

      // Extract text using the method for this material type.
      if (material.type === "pdf") {
        extractedText = await extractPdfText(fileBuffer);
      } else if (material.type === "image") {
        extractedText = await extractImageText(fileBuffer);
      } else {
        extractedText = await transcribedMedia(fileBuffer);
      }

      // Stop if no readable text was extracted.
      if (!extractedText.trim()) {
        throw new BadRequest(
          `No readable text was found in "${material.title}"`
        );
      }

      // Save the extracted text for future use.
      material.extractedText = extractedText;
      await material.save();
    }

    // Add this material's text to the collection.
    materialTexts.push(extractedText);
  }

  // Combine the text from all selected materials.
  const combinedText = materialTexts.join("\n\n").trim();

  // Generate quiz questions from the combined text.
  const generatedQuestions = quizGenerator(combinedText);

  // Stop if the generator cannot create questions.
  if (generatedQuestions.length === 0) {
    throw new BadRequest(
      "No quiz questions could be generated from these files. Try materials containing explanatory sentences."
    );
  }

  // Return only the requested number of questions.
  const questions = generatedQuestions.slice(
    0,
    numberOfQuestions
  );

  return res.status(200).json({ questions });
};




// Create a new quiz.
export const createQuiz = async (req: Request, res: Response) => {
  try {
    const { topic, title, sources, questions } = req.body;

    // Check that the required quiz information is provided.
    if (
      !topic || !title || !Array.isArray(sources) || sources.length === 0 || !Array.isArray(questions) ||
      questions.length === 0
    ) {
      return res.status(400).json({
        message: "Topic, title, sources, and questions are required.",
      });
    }

    // Check that every question has its required fields.
    const validQuestions = questions.every(
      (item: any) =>
        typeof item.question === "string" &&
        item.question.trim() !== "" &&
        Array.isArray(item.options) &&
        item.options.length >= 2 &&
        typeof item.correctAnswer === "string" &&
        item.options.includes(item.correctAnswer)
    );

    if (!validQuestions) {
      return res.status(400).json({
        message:
          "Each question must have a question, at least two options, and a correct answer included in those options.",
      });
    }

    // Check that every source has a valid type and ID.
    const validSources = sources.every(
      (source: any) =>
        typeof source.sourceId === "string" &&
        source.sourceId.trim() !== "" &&
        ["learningMaterial", "note"].includes(source.sourceType)
    );

    if (!validSources) {
      return res.status(400).json({
        message: "Each source must have a valid sourceId and sourceType.",
      });
    }

    // Get the logged-in user's ID from the authentication middleware.
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required.",
      });
    }

    // Save the new quiz in MongoDB.
    const quiz = await quizModel.create({
      userId,
      topic,
      title,
      sources,
      questions,
    });

    return res.status(201).json({
      message: "Quiz created successfully.",
      quiz,
    });
  } catch (error) {
    console.error("Create quiz error:", error);

    return res.status(500).json({
      message: "Failed to create quiz.",
    });
  }
};

// Get all quizzes belonging to the logged-in user.
export const getAllQuizzes = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required.",
      });
    }

    const quizzes = await quizModel
      .find({ userId })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Quizzes fetched successfully.",
      quizzes,
    });
  } catch (error) {
    console.error("Get quizzes error:", error);

    return res.status(500).json({
      message: "Failed to fetch quizzes.",
    });
  }
};

// Get one quiz by its ID.
export const getQuizById = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required.",
      });
    }

    const quiz = await quizModel.findOne({
      _id: id,
      userId,
    });

    if (!quiz) {
      return res.status(404).json({
        message: "Quiz not found.",
      });
    }

    return res.status(200).json({
      message: "Quiz fetched successfully.",
      quiz,
    });
  } catch (error) {
    console.error("Get quiz error:", error);

    return res.status(500).json({
      message: "Failed to fetch quiz.",
    });
  }
};

// Update an existing quiz.
export const updateQuiz = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { id } = req.params;
    const { topic, title, sources, questions } = req.body;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required.",
      });
    }

    // Build an update object using only fields supplied by the client.
    const updates: Record<string, unknown> = {};

    if (topic !== undefined) updates.topic = topic;
    if (title !== undefined) updates.title = title;
    if (sources !== undefined) updates.sources = sources;
    if (questions !== undefined) updates.questions = questions;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "Provide at least one field to update.",
      });
    }

    const quiz = await quizModel.findOneAndUpdate(
      { _id: id, userId },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!quiz) {
      return res.status(404).json({
        message: "Quiz not found.",
      });
    }

    return res.status(200).json({
      message: "Quiz updated successfully.",
      quiz,
    });
  } catch (error) {
    console.error("Update quiz error:", error);

    return res.status(500).json({
      message: "Failed to update quiz.",
    });
  }
};

// Delete a quiz.
export const deleteQuiz = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required.",
      });
    }

    const quiz = await quizModel.findOneAndDelete({
      _id: id,
      userId,
    });

    if (!quiz) {
      return res.status(404).json({
        message: "Quiz not found.",
      });
    }

    return res.status(200).json({
      message: "Quiz deleted successfully.",
    });
  } catch (error) {
    console.error("Delete quiz error:", error);

    return res.status(500).json({
      message: "Failed to delete quiz.",
    });
  }
};



