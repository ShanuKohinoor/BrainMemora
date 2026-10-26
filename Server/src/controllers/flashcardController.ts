
import type { Request, Response } from "express";
import mongoose from "mongoose";
import {
  BadRequest,
  NotFoundError,
  UnauthorizedError,
} from "../utils/error.js";
import { flashcardModel } from "../models/flashcard.js";
import { learningMaterialModel } from "../models/learningMaterials.js";
import { noteModel } from "../models/notes.js";
import { flashcardGenerator } from "../utils/flashcardGenerator.js";
import { downloadFileFromS3 } from "../services/storageServices.js";
import { extractPdfText } from "../utils/pdfExtractor.js";
import { extractImageText } from "../utils/imageTextExtractor.js";
import { transcribedMedia } from "../utils/whisperTranscriber.js";

// Create one flashcard manually.
export const createFlashcard = async (
  req: Request,
  res: Response
) => {
  if (!req.userId) {
    throw new UnauthorizedError("Please login first");
  }

  const {
    topic,
    title,
    sources,
    difficultyLevel,
    question,
    answer,
  } = req.body;

  if (
    typeof topic !== "string" ||
    !topic.trim() ||
    typeof question !== "string" ||
    !question.trim() ||
    typeof answer !== "string" ||
    !answer.trim()
  ) {
    throw new BadRequest(
      "Topic, question, and answer are required"
    );
  }

  if (
    difficultyLevel !== "easy" &&
    difficultyLevel !== "medium" &&
    difficultyLevel !== "hard"
  ) {
    throw new BadRequest(
      "Difficulty Level must be easy, medium or hard"
    );
  }

  const userId = req.userId;

  if (!Array.isArray(sources) || sources.length === 0) {
    throw new BadRequest("At least one source is required");
  }

  for (const source of sources) {
    if (
      !source ||
      typeof source.sourceId !== "string" ||
      !mongoose.isValidObjectId(source.sourceId) ||
      (source.sourceType !== "note" &&
        source.sourceType !== "learningMaterial")
    ) {
      throw new BadRequest("Invalid source");
    }

    if (source.sourceType === "note") {
      const note = await noteModel.findOne({
        _id: source.sourceId,
        userId,
      });

      if (!note) {
        throw new NotFoundError("Note not found");
      }
    }

    if (source.sourceType === "learningMaterial") {
      const material = await learningMaterialModel.findOne({
        _id: source.sourceId,
        userId,
      });

      if (!material) {
        throw new NotFoundError("Material not found");
      }
    }
  }

  const newFlashcard = await flashcardModel.create({
    userId,
    topic: topic.trim(),
    title,
    sources,
    difficultyLevel,
    question: question.trim(),
    answer: answer.trim(),
  });

  res.status(201).json({
    success: true,
    message: "Flashcard created successfully",
    data: newFlashcard,
  });
};


// Generate flashcards automatically from selected PDF and image materials.
 

export const generateFlashcardsFromMaterials = async (
  req: Request,
  res: Response
) => {
  // Check that the user is logged in.
  if (!req.userId) {
    throw new UnauthorizedError("Please login first");
  }

  const userId = req.userId;

  // Read the selected material IDs and generation settings.
  const {
    materialIds,
    numberOfCards = 10,
    difficultyLevel = "medium",
  } = req.body;

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

  // Validate the requested number of flashcards.
  if (
    !Number.isInteger(numberOfCards) ||
    numberOfCards < 1 ||
    numberOfCards > 100
  ) {
    throw new BadRequest(
      "Number of flashcards must be between 1 and 100"
    );
  }

  // Validate the difficulty level.
  if (
    difficultyLevel !== "easy" &&
    difficultyLevel !== "medium" &&
    difficultyLevel !== "hard"
  ) {
    throw new BadRequest(
      "Difficulty Level must be easy, medium or hard"
    );
  }

  // Find the selected materials belonging to this user.
  const materials = await learningMaterialModel.find({
    _id: { $in: materialIds },
    userId,
  });

  // Ensure every selected ID belongs to this user.
  if (materials.length !== new Set(materialIds).size) {
    throw new NotFoundError(
      "One or more selected learning materials were not found"
    );
  }

  // Collect readable text from all selected materials.
  const materialTexts: string[] = [];

  for (const material of materials) {
    // Support PDFs, images, audio, and video.
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

    // Start with previously saved extracted text.
    let extractedText =
      material.extractedText?.trim() ?? "";

    // Check whether the saved text is only a PDF page marker.
    const isPageMarker =
      /^--\s*\d+\s+of\s+\d+\s+--$/i.test(extractedText);

    // Extract again if the text is empty or only a page marker.
    if (!extractedText || isPageMarker) {
      // Check that the original file exists in S3.
      if (!material.fileKey) {
        throw new BadRequest(
          `"${material.title}" has no uploaded file`
        );
      }

      // Download the original file from S3.
      const fileBuffer = await downloadFileFromS3(
        material.fileKey
      );

    // Extract text using the correct method for each material type.
    if (material.type === "pdf") {
      extractedText = await extractPdfText(fileBuffer);
    } else if (material.type === "image") {
      extractedText = await extractImageText(fileBuffer);
    } else if (
      material.type === "audio" ||
      material.type === "video"
    ) {
      extractedText = await transcribedMedia(fileBuffer);
    }

// Stop if no readable text was extracted.
      if (!extractedText.trim()) {
        throw new BadRequest(
          `No readable text was found in "${material.title}"`
        );
      }

      // Save extracted text for future use.
      material.extractedText = extractedText;
      await material.save();
    }

    // Add the extracted text for flashcard generation.
    materialTexts.push(extractedText);
  }

  // Combine the text from all selected files.
  const combinedText = materialTexts.join("\n\n").trim();

  // Generate question-and-answer pairs.
  const generatedFlashcards =
    flashcardGenerator(combinedText);

  // Stop if the generator could not create flashcards.
  if (generatedFlashcards.length === 0) {
    throw new BadRequest(
      "No flashcards could be generated from these files. Try files containing explanatory sentences."
    );
  }

  // Keep only the requested number of flashcards.
  const selectedFlashcards = generatedFlashcards.slice(
    0,
    numberOfCards
  );

  // Link each flashcard to the selected learning materials.
  const sources = materials.map((material) => ({
    sourceId: material._id.toString(),
    sourceType: "learningMaterial" as const,
  }));

  // Save the generated flashcards in MongoDB.
  const savedFlashcards = await flashcardModel.insertMany(
    selectedFlashcards.map((flashcard) => ({
      userId,
      topic: materials[0]!.topic,
      title: materials[0]!.title,
      sources,
      difficultyLevel,
      question: flashcard.question,
      answer: flashcard.answer,
    }))
  );

  // Return the saved flashcards to the frontend.
  return res.status(201).json({
    success: true,
    message:
      "Flashcards generated successfully from learning materials",
    count: savedFlashcards.length,
    data: savedFlashcards,
  });
};






// Generate flashcards automatically from a selected note
export const generateFlashcardsFromNote = async (
  req: Request,
  res: Response
) => {


  // Check the user is logged in
  if (!req.userId) {
    throw new UnauthorizedError("Please login first");
  }

  //  Read the note id and flashcard generation settings
  const {
    noteId, numberOfCards = 10, difficultyLevel = "medium",} = req.body;

  //  Validate the note Id
  if (
    typeof noteId !== "string" ||
    !noteId.trim() ||
    !mongoose.isValidObjectId(noteId)
  ) {
    throw new BadRequest("A valid note ID is required");
  }

  //  Validate the number of cards
  if (
    !Number.isInteger(numberOfCards) ||
    numberOfCards < 1 ||
    numberOfCards > 100
  ) {
    throw new BadRequest(
      "Number of flashcards must be between 1 and 100"
    );
  }

  //  Validate the difficulty Level
  if (
    difficultyLevel !== "easy" &&
    difficultyLevel !== "medium" &&
    difficultyLevel !== "hard"
  ) {
    throw new BadRequest(
      "Difficulty Level must be easy, medium or hard"
    );
  }

  const userId = req.userId;

  //  Find the note belonging to this user
  const note = await noteModel.findOne({
    _id: noteId,
    userId,
  });

  if (!note) {
    throw new NotFoundError("Note not found");
  }

  //  Generate question and answer pairs from the note text
  const generatedFlashcards = flashcardGenerator(note.content);

  if (generatedFlashcards.length === 0) {
    throw new BadRequest(
      "No flashcards could be generated."
    );
  }

  //  Keep only the requested number of generated cards
  const selectedFlashcards = generatedFlashcards.slice(
    0,
    numberOfCards
  );

  //  Link each generated flashcard to its original note
  const sources = [
    {
      sourceId: note._id.toString(),
      sourceType: "note" as const,
    },
  ];

  //  Save the generated flashcards to MongoDB
  const savedFlashcards = await flashcardModel.insertMany(
    selectedFlashcards.map((flashcard) => ({
      userId,
      topic: note.topic,
      title: note.title,
      sources,
      difficultyLevel,
      question: flashcard.question,
      answer: flashcard.answer,
    }))
  );

  //  Return the saved flashcards
  res.status(201).json({
    success: true,
    message: "Flashcards generated successfully",
    count: savedFlashcards.length,
    data: savedFlashcards,
  });
};




// Get all flashcards belonging to the logged-in user
export const getAllFlashCards = async (
  req: Request,
  res: Response
) => {
  if (!req.userId) {
    throw new UnauthorizedError("Please login first");
  }

  const flashcards = await flashcardModel.find({
    userId: req.userId,
  });

  res.status(200).json({
    success: true,
    message: "Fetched all flashcards successfully",
    data: flashcards,
  });
};

// Get one flashcard.
export const getOneFlashCard = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  if (!req.userId) {
    throw new UnauthorizedError("Please login first");
  }

  const { id } = req.params;

  const flashcard = await flashcardModel.findOne({
    _id: id,
    userId: req.userId,
  });

  if (!flashcard) {
    throw new NotFoundError("Flashcard not found");
  }

  res.status(200).json({
    success: true,
    message: "Fetched flashcard successfully",
    data: flashcard,
  });
};

// Update a flashcard.
export const updateFlashCard = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  if (!req.userId) {
    throw new UnauthorizedError("Please login first");
  }

  const {
    topic,
    title,
    sources,
    difficultyLevel,
    question,
    answer,
  } = req.body;

  if (
    difficultyLevel !== "easy" &&
    difficultyLevel !== "medium" &&
    difficultyLevel !== "hard"
  ) {
    throw new BadRequest(
      "Difficulty Level must be easy, medium or hard"
    );
  }

  const { id } = req.params;

  const updatedFlashcard = await flashcardModel.findOneAndUpdate(
    { _id: id, userId: req.userId },
    { topic, title, sources, difficultyLevel, question, answer },
    { returnDocument: "after", runValidators: true }
  );

  if (!updatedFlashcard) {
    throw new NotFoundError("Flashcard not found");
  }

  res.status(200).json({
    success: true,
    message: "Flashcard updated successfully",
    data: updatedFlashcard,
  });
};

// Delete a flashcard.
export const deleteFlashCard = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  if (!req.userId) {
    throw new UnauthorizedError("Please login first");
  }

  const { id } = req.params;

  const flashcard = await flashcardModel.findOne({
    _id: id,
    userId: req.userId,
  });

  if (!flashcard) {
    throw new NotFoundError("Flashcard not found");
  }

  await flashcardModel.deleteOne({
    _id: id,
    userId: req.userId,
  });

  res.status(200).json({
    success: true,
    message: "Flashcard deleted successfully",
    data: null,
  });
};
