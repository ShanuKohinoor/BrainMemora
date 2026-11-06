
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


// Generate flashcards from selected learning materials.
export const generateFlashcardsFromMaterials = async (
  req: Request,
  res: Response
) => {
  // Check whether the user is logged in.
  if (!req.userId) {
    throw new UnauthorizedError("Please login first");
  }

  const userId = req.userId;

  // Get selected materials and generation settings.
  const {
    materialIds,
    numberOfCards = 10,
    difficultyLevel = "medium",
  } = req.body;

  // Validate material IDs.
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

  // Validate the number of flashcards.
  if (
    !Number.isInteger(numberOfCards) ||
    numberOfCards < 1 ||
    numberOfCards > 100
  ) {
    throw new BadRequest(
      "Number of flashcards must be between 1 and 100"
    );
  }

  // Validate difficulty level.
  if (
    difficultyLevel !== "easy" &&
    difficultyLevel !== "medium" &&
    difficultyLevel !== "hard"
  ) {
    throw new BadRequest(
      "Difficulty Level must be easy, medium or hard"
    );
  }

  // Find materials belonging to the logged-in user.
  const materials = await learningMaterialModel.find({
    _id: { $in: materialIds },
    userId,
  });

  // Check whether all selected materials were found.
  if (materials.length !== new Set(materialIds).size) {
    throw new NotFoundError(
      "One or more selected learning materials were not found"
    );
  }

  // Group materials by topic and title.
  const materialGroups = new Map<
    string,
    typeof materials
  >();

  for (const material of materials) {
    const topic = material.topic.trim();
    const title = material.title.trim();

    const groupKey = JSON.stringify([topic, title]);

    if (!materialGroups.has(groupKey)) {
      materialGroups.set(groupKey, []);
    }

    materialGroups.get(groupKey)!.push(material);
  }

  // Store generated flashcards before saving them.
  const flashcardsToSave: {
    userId: string;
    topic: string;
    title: string;
    sources: {
      sourceId: string;
      sourceType: "learningMaterial";
    }[];
    difficultyLevel: "easy" | "medium" | "hard";
    question: string;
    answer: string;
  }[] = [];

  // Generate flashcards for each group.
  for (const [groupKey, groupMaterials] of materialGroups) {
    const [topic, title] = JSON.parse(groupKey) as [
      string,
      string
    ];

    const materialTexts: string[] = [];

    // Extract text from each material.
    for (const material of groupMaterials) {
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

      // Use saved extracted text if available.
      let extractedText =
        material.extractedText?.trim() ?? "";

      const isPageMarker =
        /^--\s*\d+\s+of\s+\d+\s+--$/i.test(extractedText);

      // Extract text again if needed.
      if (!extractedText || isPageMarker) {
        if (!material.fileKey) {
          throw new BadRequest(
            `"${material.title}" has no uploaded file`
          );
        }

        // Download the file from S3.
        const fileBuffer = await downloadFileFromS3(
          material.fileKey
        );

        // Extract text based on the material type.
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

        if (!extractedText.trim()) {
          throw new BadRequest(
            `No readable text was found in "${material.title}"`
          );
        }

        // Save extracted text for future use.
        material.extractedText = extractedText;
        await material.save();
      }

      materialTexts.push(extractedText);
    }

    // Combine text from this group only.
    const combinedText = materialTexts.join("\n\n").trim();

    // Generate question and answer pairs.
    const generatedFlashcards =
      flashcardGenerator(combinedText);

    // Continue to the next group if no cards were generated.
    if (generatedFlashcards.length === 0) {
      continue;
    }

    // Find existing flashcards for this topic and title.
    const existingFlashcards = await flashcardModel.find({
      userId,
      topic,
      title,
    });

    // Remove incomplete and duplicate questions.
    const uniqueFlashcards = generatedFlashcards.filter(
      (flashcard) => {
        // Skip cards with missing questions or answers.
        if (
          !flashcard.question?.trim() ||
          !flashcard.answer?.trim()
        ) {
          return false;
        }

        const question = flashcard.question
          .trim()
          .toLowerCase();

        const alreadyExists = existingFlashcards.some(
          (existing) =>
            existing.question.trim().toLowerCase() === question
        );

        const alreadySelected = flashcardsToSave.some(
          (existing) =>
            existing.topic === topic &&
            existing.title === title &&
            existing.question.trim().toLowerCase() === question
        );

        return !alreadyExists && !alreadySelected;
      }
    );

    // Select the requested number of new flashcards.
    const selectedFlashcards = uniqueFlashcards.slice(
      0,
      numberOfCards
    );

    // Link cards to their source materials.
    const sources = groupMaterials.map((material) => ({
      sourceId: material._id.toString(),
      sourceType: "learningMaterial" as const,
    }));

    // Prepare each flashcard for saving.
    for (const flashcard of selectedFlashcards) {
      if (
        !flashcard.question?.trim() ||
        !flashcard.answer?.trim()
      ) {
        continue;
      }

      flashcardsToSave.push({
        userId,
        topic,
        title,
        sources,
        difficultyLevel,
        question: flashcard.question.trim(),
        answer: flashcard.answer.trim(),
      });
    }
  }

  // Check whether any new flashcards were generated.
  if (flashcardsToSave.length === 0) {
    throw new BadRequest(
      "No new flashcards could be generated. All generated questions may already exist."
    );
  }

  // Save all generated flashcards.
  const savedFlashcards = await flashcardModel.insertMany(
    flashcardsToSave
  );

  res.status(201).json({
    success: true,
    message: "Flashcards generated successfully from learning materials",
    count: savedFlashcards.length,
    data: savedFlashcards,
  });
};


// Generate flashcards from a selected note.
export const generateFlashcardsFromNote = async (
  req: Request,
  res: Response
) => {
  // Check whether the user is logged in.
  if (!req.userId) {
    throw new UnauthorizedError("Please login first");
  }

  // Get the note ID and generation settings.
  const {
    noteId,
    numberOfCards = 10,
    difficultyLevel = "medium",
  } = req.body;

  // Validate the note ID.
  if (
    typeof noteId !== "string" ||
    !noteId.trim() ||
    !mongoose.isValidObjectId(noteId)
  ) {
    throw new BadRequest("A valid note ID is required");
  }

  // Validate the number of flashcards.
  if (
    !Number.isInteger(numberOfCards) ||
    numberOfCards < 1 ||
    numberOfCards > 100
  ) {
    throw new BadRequest(
      "Number of flashcards must be between 1 and 100"
    );
  }

  // Validate difficulty level.
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

  // Find the note belonging to this user.
  const note = await noteModel.findOne({
    _id: noteId,
    userId,
  });

  if (!note) {
    throw new NotFoundError("Note not found");
  }

  // Generate question and answer pairs.
  const generatedFlashcards = flashcardGenerator(note.content);

  if (generatedFlashcards.length === 0) {
    throw new BadRequest(
      "No flashcards could be generated."
    );
  }

  // Select the requested number of cards.
  const selectedFlashcards = generatedFlashcards.slice(
    0,
    numberOfCards
  );

  // Link flashcards to the original note.
  const sources = [
    {
      sourceId: note._id.toString(),
      sourceType: "note" as const,
    },
  ];

  // Save flashcards in MongoDB.
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

  res.status(201).json({
    success: true,
    message: "Flashcards generated successfully",
    count: savedFlashcards.length,
    data: savedFlashcards,
  });
};


// Get all flashcards belonging to the logged-in user.
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
