
import type { Request, Response } from "express";
import { UnauthorizedError } from "../utils/error.js";
import { LearningSessionModel } from "../models/learningSession.js";
import { quizModel } from "../models/quiz.js";
import { flashcardModel } from "../models/flashcard.js";

// Create Learning Sessions
export const createLearningSessions = async (
  req: Request,
  res: Response
) => {
  if (!req.userId) {
    throw new UnauthorizedError("Please login first");
  }

  const { topic } = req.body;
  const userId = req.userId;

  // Find existing sessions for this user and topic
  const existingSessions = await LearningSessionModel.find({
    userId,
    topic
  }).sort({ order: 1 });

  // Fetch quizzes and flashcards for this user and topic
  const [quizzes, flashcards] = await Promise.all([
    quizModel.find({ userId, topic }).sort({ createdAt: 1 }),
    flashcardModel.find({ userId, topic }).sort({ createdAt: 1 })
  ]);

  // Group quizzes and flashcards by title
  const sessionGroups = new Map<
    string,
    {
      title: string;
      quizIds: string[];
      flashcardIds: string[];
    }
  >();

  // Group quizzes by title
  for (const quiz of quizzes) {
    const title = quiz.title.trim();
    const key = title.toLowerCase();

    let group = sessionGroups.get(key);

    if (!group) {
      group = {
        title,
        quizIds: [],
        flashcardIds: []
      };

      sessionGroups.set(key, group);
    }

    group.quizIds.push(quiz._id.toString());
  }

  // Group flashcards by title
  for (const flashcard of flashcards) {
    const title = flashcard.title.trim();
    const key = title.toLowerCase();

    let group = sessionGroups.get(key);

    if (!group) {
      group = {
        title,
        quizIds: [],
        flashcardIds: []
      };

      sessionGroups.set(key, group);
    }

    group.flashcardIds.push(flashcard._id.toString());
  }

  // Get the last session order
  let nextOrder = existingSessions.reduce(
    (max, session) => Math.max(max, session.order),
    0
  );

  // Process each title group
  for (const group of sessionGroups.values()) {

    // Check whether this title already has a session
    const existingSession = existingSessions.find(
      (session) =>
        session.title.trim().toLowerCase() ===
        group.title.toLowerCase()
    );

if (existingSession) {
  // Find newly added quiz and flashcard IDs
  const newQuizIds = group.quizIds.filter(
    (id) => !existingSession.quizIds.includes(id)
  );

  const newFlashcardIds = group.flashcardIds.filter(
    (id) => !existingSession.flashcardIds.includes(id)
  );

  // Add IDs without creating duplicates
  await LearningSessionModel.updateOne(
    { _id: existingSession._id, userId },
    {
      $addToSet: {
        quizIds: { $each: group.quizIds },
        flashcardIds: { $each: group.flashcardIds }
      },
      $set: {
        quizCompleted:
          newQuizIds.length > 0
            ? false
            : existingSession.quizCompleted,

        flashcardCompleted:
          newFlashcardIds.length > 0
            ? false
            : existingSession.flashcardCompleted,

        ...(newQuizIds.length > 0 || newFlashcardIds.length > 0
          ? { isCompleted: false }
          : {})
      },
      ...(newQuizIds.length > 0 || newFlashcardIds.length > 0
        ? { $unset: { completedAt: 1 } }
        : {})
    }
  );
}
     else {
      // Create a new session for a new title
      nextOrder++;

      await LearningSessionModel.create({
        userId,
        topic,
        title: group.title,
        order: nextOrder,
        quizIds: group.quizIds,
        flashcardIds: group.flashcardIds,
        quizCompleted: group.quizIds.length === 0,
        flashcardCompleted: group.flashcardIds.length === 0,
        isUnlocked: nextOrder === 1,
        isCompleted: false
      });
    }
  }

  // Fetch all sessions after updating or creating them
  const allSessions = await LearningSessionModel.find({
    userId,
    topic
  }).sort({ order: 1 });

  return res.status(200).json({
    message: "Learning sessions processed successfully",
    success: true,
    data: allSessions
  });
};

// Get Learning Sessions
export const getLearningSession = async (
  req: Request,
  res: Response
) => {
  if (!req.userId) {
    throw new UnauthorizedError("Please login again");
  }

  const userId = req.userId;
  const topic = req.query.topic as string;

  // Find sessions for this user and topic
  const sessions = await LearningSessionModel.find({
    userId,
    topic
  }).sort({ order: 1 });

  return res.status(200).json({
    message: "Successfully fetched Learning Sessions",
    success: true,
    data: sessions
  });
};





// Get one learning session with its quizzes and flashcards
export const getOneLearningSession = async (
  req: Request,
  res: Response
) => {
  if (!req.userId) {
    throw new UnauthorizedError("Please login first");
  }

  const userId = req.userId;
const sessionId = req.params.id as string;

  // Find the selected session
  const session = await LearningSessionModel.findOne({
    _id: sessionId,
    userId
  });

  if (!session) {
    return res.status(404).json({
      success: false,
      message: "Learning session not found"
    });
  }

  // Fetch the quizzes and flashcards using their IDs
  const [quizzes, flashcards] = await Promise.all([
    quizModel.find({
      _id: { $in: session.quizIds },
      userId
    }),
    flashcardModel.find({
      _id: { $in: session.flashcardIds },
      userId
    })
  ]);

  return res.status(200).json({
    success: true,
    message: "Learning session fetched successfully",
    data: {
      session,
      quizzes,
      flashcards
    }
  });
};




// Mark flashcards as completed in a learning session
export const completeFlashcards = async (
  req: Request,
  res: Response
) => {
  if (!req.userId) {
    throw new UnauthorizedError("Please login first");
  }

  const userId = req.userId;
  const id = req.params.id as string;

  // Find the session belonging to this user
  const session = await LearningSessionModel.findOne({
    _id: id,
    userId
  });

  if (!session) {
    return res.status(404).json({
      success: false,
      message: "Learning session not found"
    });
  }

  if (session.flashcardIds.length === 0) {
    return res.status(400).json({
      success: false,
      message: "No flashcards available in this session"
    });
  }

  // Mark flashcards as completed
  const updatedSession = await LearningSessionModel.findOneAndUpdate(
    { _id:id, userId },
    {
      $set: {
        flashcardCompleted: true,

        // Complete the session only if the quizzes are also completed
        ...(session.quizCompleted && {
          isCompleted: true,
          completedAt: session.completedAt || new Date()
        })
      }
    },
    { new: true }
  );

  // Unlock the next session if both activities are completed
  if (updatedSession?.isCompleted) {
    const nextSession = await LearningSessionModel.findOne({
      userId,
      topic: updatedSession.topic,
      order: { $gt: updatedSession.order }
    }).sort({ order: 1 });

    if (nextSession) {
      await LearningSessionModel.updateOne(
        { _id: nextSession._id, userId },
        { $set: { isUnlocked: true } }
      );
    }
  }

  return res.status(200).json({
    success: true,
    message: "Flashcards completed successfully",
    data: updatedSession
  });
};