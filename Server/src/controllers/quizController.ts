
import type { Request, Response } from "express";
import { quizModel } from "../models/quiz.js";
import { quizGenerator } from "../utils/quizGenerator.js";



// Generate quiz questions from learning material
export const generateQuiz = (req: Request, res: Response) => {
  try {
    const { content } = req.body;

    // Check that content was provided
    if (!content || typeof content !== "string") {
      return res.status(400).json({
        message: "Learning content is required.",
      });
    }

    // Generate questions from the content
    const questions = quizGenerator(content);

    // Return the generated questions
    return res.status(200).json({ questions });
  } catch (error) {
    console.error("Generate quiz error:", error);

    return res.status(500).json({
      message: "Failed to generate quiz.",
    });
  }
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



