
import type { Request, Response } from "express";
import { quizModel } from "../models/quiz.js";
import { quizResultModel } from "../models/quizResult.js";
import { LearningSessionModel } from "../models/learningSession.js";
import { LearningActivityModel } from "../models/learningActivity.js";
import {
  recordLearningActivity,
  updateLearningStreak,
} from "../services/gamificationService.js";
import {
  BadRequest,
  NotFoundError,
  UnauthorizedError,
} from "../utils/error.js";

// Submit quiz result
export const submitQuizResult = async (
  req: Request,
  res: Response
) => {
  if (!req.userId) {
    throw new UnauthorizedError("Please login first");
  }

  const userId = req.userId;
  const { quizId, selectedAnswers } = req.body;

  if (!Array.isArray(selectedAnswers)) {
    throw new BadRequest("Selected answers must be an array");
  }

  // Find the quiz belonging to this user
  const quiz = await quizModel.findOne({
    _id: quizId,
    userId,
  });

  if (!quiz) {
    throw new NotFoundError("Quiz not found");
  }

  if (quiz.questions.length === 0) {
    throw new BadRequest("This quiz has no questions");
  }

  if (selectedAnswers.length !== quiz.questions.length) {
    throw new BadRequest("Please fill all the questions");
  }

  // Compare selected answers with correct answers
  const answers = quiz.questions.map((question, index) => {
    const selectedAnswer = selectedAnswers[index];

    const isCorrect =
      selectedAnswer === question.correctAnswer;

    return {
      question: question.question,
      selectedAnswer,
      isCorrect,
      correctAnswer: question.correctAnswer,
    };
  });

  const totalQuestions = quiz.questions.length;

  const correctAnswers = answers.filter(
    (answer) => answer.isCorrect
  ).length;

  // Calculate quiz percentage
  const percentage =
    (correctAnswers / totalQuestions) * 100;

  // Save the quiz result
  const savedResult = await quizResultModel.create({
    userId,
    quizId,
    score: correctAnswers,
    totalQuestions,
    correctAnswers,
    answers,
  });

  // Check whether this quiz was already recorded
  const existingActivity = await LearningActivityModel.findOne({
    userId,
    activityType: "quiz",
    activityId: quizId.toString(),
  });

  // Count this quiz only once
  if (!existingActivity) {
    await recordLearningActivity(
      userId,
      "quiz",
      quizId.toString(),
      true,
      0
    );
  } else {
    // Repeated quiz attempts still count towards the learning streak
    await updateLearningStreak(userId);
  }

  // Check whether this quiz belongs to a Learning Session
  const session = await LearningSessionModel.findOne({
    userId,
    quizIds: quizId,
  });

  // Update session progress only if the quiz belongs to a session
  if (session && percentage >= 80) {
    // Remember this quiz as passed.
    // $addToSet prevents duplicate quiz IDs.
    await LearningSessionModel.updateOne(
      { _id: session._id, userId },
      {
        $addToSet: {
          passedQuizIds: quizId,
        },
      }
    );

    // Fetch the updated session
    const updatedSession =
      await LearningSessionModel.findById(session._id);

    if (updatedSession) {
      // Check whether every quiz has been passed
      const allQuizzesPassed = updatedSession.quizIds.every(
        (id) => updatedSession.passedQuizIds.includes(id)
      );

      if (allQuizzesPassed) {
        // Both quiz and flashcard completion are required
        const isSessionCompleted =
          updatedSession.flashcardCompleted;

        await LearningSessionModel.updateOne(
          { _id: updatedSession._id, userId },
          {
            $set: {
              quizCompleted: true,
              ...(isSessionCompleted && {
                isCompleted: true,
                completedAt: updatedSession.completedAt || new Date(),
              }),
            },
          }
        );

        // Record the session only when it becomes completed for the first time
        if (isSessionCompleted && !updatedSession.isCompleted) {
          await recordLearningActivity(
            userId,
            "session",
            updatedSession._id.toString(),
            true,
            0
          );
        }

        // Unlock the next session only when both are completed
        if (isSessionCompleted) {
          const nextSession =
            await LearningSessionModel.findOne({
              userId,
              topic: updatedSession.topic,
              order: { $gt: updatedSession.order },
            }).sort({ order: 1 });

          if (nextSession) {
            await LearningSessionModel.updateOne(
              { _id: nextSession._id, userId },
              {
                $set: {
                  isUnlocked: true,
                },
              }
            );
          }
        }
      }
    }
  }

  return res.status(201).json({
    message: "Quiz Result submitted successfully",
    success: true,
    percentage,
    data: savedResult,
  });
};

// Get quiz attempt history
export const getQuizHistory = async (
  req: Request,
  res: Response
) => {
  if (!req.userId) {
    throw new UnauthorizedError("Please login first");
  }

  const quizId = req.params.id as string;
  const userId = req.userId;

  // Check whether the quiz belongs to this user
  const quiz = await quizModel.findOne({
    _id: quizId,
    userId,
  });

  if (!quiz) {
    throw new NotFoundError("Quiz not found");
  }

  // Get all attempts for this quiz
  const history = await quizResultModel
    .find({ quizId, userId })
    .sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    message: "Quiz history fetched successfully",
    data: history,
  });
};







// Delete one quiz attempt
export const deleteQuizAttempt = async (
  req: Request,
  res: Response
) => {
  if (!req.userId) {
    throw new UnauthorizedError("Please login first");
  }

  const userId = req.userId;
  const attemptId = req.params.attemptId as string;

  const deletedAttempt = await quizResultModel.findOneAndDelete({
    _id: attemptId,
    userId,
  });

  if (!deletedAttempt) {
    throw new NotFoundError("Quiz attempt not found");
  }

  return res.status(200).json({
    success: true,
    message: "Quiz attempt deleted successfully",
  });
};


// Delete multiple quiz attempts
export const deleteSelectedQuizAttempts = async (
  req: Request,
  res: Response
) => {
  if (!req.userId) {
    throw new UnauthorizedError("Please login first");
  }

  const userId = req.userId;
  const attemptIds = req.body.attemptIds;

  if (!Array.isArray(attemptIds) || attemptIds.length === 0) {
    throw new BadRequest("Please select at least one attempt");
  }

  const deletedAttempts = await quizResultModel.deleteMany({
    _id: { $in: attemptIds },
    userId,
  });

  return res.status(200).json({
    success: true,
    message: "Selected quiz attempts deleted successfully",
    deletedCount: deletedAttempts.deletedCount,
  });
};
