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


// Generate quiz questions from selected learning materials
export const generateQuiz = async (
  req: Request,
  res: Response
) => {
  // Check if the user is logged in
  if (!req.userId) {
    throw new UnauthorizedError("Please login first");
  }

  const userId = req.userId;

  // Get the selected material IDs and question count
  const { materialIds, numberOfQuestions = 5 } = req.body;

  // Check if the selected material IDs are valid
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

  // Check if the question count is between 1 and 20
  if (
    !Number.isInteger(numberOfQuestions) ||
    numberOfQuestions < 1 ||
    numberOfQuestions > 20
  ) {
    throw new BadRequest(
      "Number of questions must be between 1 and 20"
    );
  }

  // Find materials that belong to the logged-in user
  const materials = await learningMaterialModel.find({
    _id: { $in: materialIds },
    userId,
  });

  // Check if all selected materials were found
  if (materials.length !== new Set(materialIds).size) {
    throw new NotFoundError(
      "One or more selected learning materials were not found"
    );
  }

  // Store the extracted text from all materials
  const materialTexts: string[] = [];

  for (const material of materials) {
    // Check if the material type is supported
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

    // Use the text already saved in MongoDB
    let extractedText =
      material.extractedText?.trim() ?? "";

    // Check if the saved text contains only a PDF page marker
    const isPageMarker =
      /^--\s*\d+\s+of\s+\d+\s+--$/i.test(extractedText);

    // Extract the text again if it is missing or incomplete
    if (!extractedText || isPageMarker) {
      // Check if the original file exists in S3
      if (!material.fileKey) {
        throw new BadRequest(
          `"${material.title}" has no uploaded file`
        );
      }

      // Download the file from S3
      const fileBuffer = await downloadFileFromS3(
        material.fileKey
      );

      // Extract text based on the material type
      if (material.type === "pdf") {
        extractedText = await extractPdfText(fileBuffer);
      } else if (material.type === "image") {
        extractedText = await extractImageText(fileBuffer);
      } else {
        extractedText = await transcribedMedia(fileBuffer);
      }

      // Check if any readable text was found
      if (!extractedText.trim()) {
        throw new BadRequest(
          `No readable text was found in "${material.title}"`
        );
      }

      // Save the extracted text for future use
      material.extractedText = extractedText;
      await material.save();
    }

    // Add the extracted text to the collection
    materialTexts.push(extractedText);
  }

  // Combine the text from all selected materials
  const combinedText = materialTexts.join("\n\n").trim();

  // Generate questions from the combined text
  const generatedQuestions = quizGenerator(combinedText);

  // Check if any questions were generated
  if (generatedQuestions.length === 0) {
    throw new BadRequest(
      "No quiz questions could be generated from these files. Try materials containing explanatory sentences."
    );
  }

  // Return the requested number of questions
  const questions = generatedQuestions.slice(
    0,
    numberOfQuestions
  );

  return res.status(200).json({ questions });
};


// Create a new quiz
export const createQuiz = async (req: Request, res: Response) => {
  try {
    // Check if the user is logged in
    if (!req.userId) {
      throw new UnauthorizedError("Please login first");
    }

    const userId = req.userId;

    const { topic, title, sources, questions } = req.body;

    // Check if all required quiz details are provided
    if (
      !topic ||
      !title ||
      !Array.isArray(sources) ||
      sources.length === 0 ||
      !Array.isArray(questions) ||
      questions.length === 0
    ) {
      return res.status(400).json({
        message: "Topic, title, sources, and questions are required",
      });
    }

    // Check if every question has valid fields
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
          "Each question must have a question, at least two options, and a correct answer included in those options",
      });
    }

    // Check if every source has a valid type and ID
    const validSources = sources.every(
      (source: any) =>
        typeof source.sourceId === "string" &&
        source.sourceId.trim() !== "" &&
        ["learningMaterial", "note"].includes(source.sourceType)
    );

    if (!validSources) {
      return res.status(400).json({
        message: "Each source must have a valid sourceId and sourceType",
      });
    }

    // Save the quiz in MongoDB
    const quiz = await quizModel.create({
      userId,
      topic,
      title,
      sources,
      questions,
    });

    return res.status(201).json({
      message: "Quiz created successfully",
      quiz,
    });
  } catch (error) {
    console.error("Create quiz error:", error);

    return res.status(500).json({
      message: "Failed to create quiz",
    });
  }
};


// Get all quizzes belonging to the logged-in user
export const getAllQuizzes = async (req: Request, res: Response) => {
  try {
    // Check if the user is logged in
    if (!req.userId) {
      throw new UnauthorizedError("Please login first");
    }

    const userId = req.userId;

    // Find all quizzes belonging to this user
    const quizzes = await quizModel
      .find({ userId })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Quizzes fetched successfully",
      quizzes,
    });
  } catch (error) {
    console.error("Get quizzes error:", error);

    return res.status(500).json({
      message: "Failed to fetch quizzes",
    });
  }
};


// Get one quiz by its ID
export const getQuizById = async (req: Request, res: Response) => {
  try {
    // Check if the user is logged in
    if (!req.userId) {
      throw new UnauthorizedError("Please login first");
    }

    const userId = req.userId;
    const { id } = req.params;

    // Find the quiz that belongs to this user
    const quiz = await quizModel.findOne({
      _id: id,
      userId,
    });

    if (!quiz) {
      return res.status(404).json({
        message: "Quiz not found",
      });
    }

    return res.status(200).json({
      message: "Quiz fetched successfully",
      quiz,
    });
  } catch (error) {
    console.error("Get quiz error:", error);

    return res.status(500).json({
      message: "Failed to fetch quiz",
    });
  }
};


// Update an existing quiz
export const updateQuiz = async (req: Request, res: Response) => {
  try {
    // Check if the user is logged in
    if (!req.userId) {
      throw new UnauthorizedError("Please login first");
    }

    const userId = req.userId;
    const { id } = req.params;
    const { topic, title, sources, questions } = req.body;

    // Store only the fields provided by the user
    const updates: Record<string, unknown> = {};

    if (topic !== undefined) updates.topic = topic;
    if (title !== undefined) updates.title = title;
    if (sources !== undefined) updates.sources = sources;
    if (questions !== undefined) updates.questions = questions;

    // Check if there is anything to update
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "Provide at least one field to update",
      });
    }

    // Update the quiz that belongs to this user
    const quiz = await quizModel.findOneAndUpdate(
      { _id: id, userId },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!quiz) {
      return res.status(404).json({
        message: "Quiz not found",
      });
    }

    return res.status(200).json({
      message: "Quiz updated successfully",
      quiz,
    });
  } catch (error) {
    console.error("Update quiz error:", error);

    return res.status(500).json({
      message: "Failed to update quiz",
    });
  }
};


// Delete a quiz
export const deleteQuiz = async (req: Request, res: Response) => {
  try {
    // Check if the user is logged in
    if (!req.userId) {
      throw new UnauthorizedError("Please login first");
    }

    const userId = req.userId;
    const { id } = req.params;

    // Delete only the quiz that belongs to this user
    const quiz = await quizModel.findOneAndDelete({
      _id: id,
      userId,
    });

    if (!quiz) {
      return res.status(404).json({
        message: "Quiz not found",
      });
    }

    return res.status(200).json({
      message: "Quiz deleted successfully",
    });
  } catch (error) {
    console.error("Delete quiz error:", error);

    return res.status(500).json({
      message: "Failed to delete quiz",
    });
  }
};