
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

import { DashboardLayout } from "../components/DashboardLayout";
import {
    getOneLearningSession,
    completeFlashcardsSession
} from "../services/learningSessionService";

import type { LearningSession } from "../types/learningSession.types";
import type { Quiz } from "../types/quiz.types";
import type { Flashcard } from "../types/flashcard.types";

import FlashcardAssessment from "../components/FlashcardAssessment";
import QuizAssessment from "../components/QuizAssessment";

interface LearningSessionData {
    session: LearningSession;
    quizzes: Quiz[];
    flashcards: Flashcard[];
}

export default function LearningSessionDetails() {
    const { sessionId } = useParams();
    const navigate = useNavigate();

    const [sessionData, setSessionData] =
        useState<LearningSessionData | null>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    const [showFlashcards, setShowFlashcards] = useState(false);
    const [isCompletingReview, setIsCompletingReview] = useState(false);
    const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);

    // Save flashcard completion in the backend
    const handleFinishReview = async () => {
        if (!sessionId || isCompletingReview) return;

        try {
            setIsCompletingReview(true);

            const updatedSession =
                await completeFlashcardsSession(sessionId);

            setSessionData((previousData) =>
                previousData
                    ? { ...previousData, session: updatedSession }
                    : previousData
            );
        } catch (error) {
            console.error("Error completing flashcards:", error);
            throw error;
        } finally {
            setIsCompletingReview(false);
        }
    };


    // Refresh session data after passing a quiz
        const handleQuizPassed = async () => {
            if (!sessionId) return;

            try {
                const updatedData = await getOneLearningSession(sessionId);
                setSessionData(updatedData);
            } catch (error) {
                console.error("Error refreshing session:", error);
            }
        };

    // Fetch the selected learning session
    useEffect(() => {
        const fetchSession = async () => {
            if (!sessionId) {
                setError("Learning session ID is missing.");
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                setError("");

                const data = await getOneLearningSession(sessionId);
                setSessionData(data);
            } catch (error) {
                console.error("Error fetching learning session:", error);
                setError("Unable to load this learning session.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchSession();
    }, [sessionId]);

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="p-8 text-center">
                    Loading learning session...
                </div>
            </DashboardLayout>
        );
    }

    if (error || !sessionData) {
        return (
            <DashboardLayout>
                <div className="p-8">
                    <p className="text-red-600">
                        {error || "Learning session not found."}
                    </p>

                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="mt-4 rounded-lg bg-[#2D4030] px-4 py-2 text-white"
                    >
                        Go Back
                    </button>
                </div>
            </DashboardLayout>
        );
    }

    const { session, quizzes, flashcards } = sessionData;

    return (
        <DashboardLayout backLabel="Back to Learning Session" backTo="/learningSession">
            <div className="mx-auto max-w-5xl space-y-8 p-6">

                {/* Session heading */}
                <div>
                    {/* <button
                        type="button"
                        onClick={() => {
                            if (showFlashcards) {
                                setShowFlashcards(false);
                            } else {
                                navigate(-1);
                            }
                        }}
                        className="mb-4 text-sm font-medium text-[#2D4030]"
                    >
                        ← Back
                    </button> */}

                    <h1 className="text-3xl font-bold text-[#2D4030]">
                        {session.title}
                    </h1>

                    <p className="mt-2 text-gray-600">
                        {session.description || session.topic}
                    </p>

                    {session.isCompleted && (
                        <p className="mt-3 font-semibold text-green-600">
                            ✓ Learning session completed!
                        </p>
                    )}
                </div>

                {showFlashcards ? (
                    /* Flashcard review screen */
                    <section>
                        <h2 className="mb-4 text-2xl font-semibold text-[#2D4030]">
                            Review Flashcards
                        </h2>

                        {flashcards.length === 0 ? (
                            <p className="rounded-xl bg-white p-5 text-gray-500">
                                No flashcards available.
                            </p>
                        ) : (
                            <FlashcardAssessment
                                topic={session.topic}
                                flashcards={flashcards}
                                onClose={() => setShowFlashcards(false)}
                                onCompleted={handleFinishReview}
                            />
                        )}
                    </section>
                ) : (
                    /* Session activity selection */
                    <div className="grid gap-6 md:grid-cols-2">

                        {/* Quiz option */}
                        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                            <h2 className="text-2xl font-semibold text-[#2D4030]">
                                Quizzes
                            </h2>

                            <p className="mt-2 text-sm text-gray-500">
                                {quizzes.length} quizzes in this session
                            </p>

                            <div className="mt-5 space-y-4">
                                {quizzes.length === 0 ? (
                                    <p className="text-sm text-gray-500">
                                        No quizzes available.
                                    </p>
                                ) : (
                                    quizzes.map((quiz: Quiz) => {
                                        const isPassed =
                                            session.passedQuizIds?.includes(
                                                quiz._id
                                            );

                                        return (
                                            <div
                                                key={quiz._id}
                                                className="flex items-center justify-between gap-3 rounded-lg bg-gray-50 p-4"
                                            >
                                                <div>
                                                    <h3 className="font-semibold text-gray-800">
                                                        {quiz.title}
                                                    </h3>

                                                    <p className="mt-1 text-xs text-gray-500">
                                                        {isPassed
                                                            ? "✓ Passed"
                                                            : "Not completed"}
                                                    </p>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setSelectedQuiz(quiz)
                                                    }
                                                    className="shrink-0 rounded-lg bg-[#F27A58] px-4 py-2 text-sm font-semibold text-white hover:bg-[#df6948]"
                                                >
                                                    {isPassed ? "Review" : "Start Quiz"}
                                                </button>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </section>

                        {/* Flashcard option */}
                        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                            <h2 className="text-2xl font-semibold text-[#2D4030]">
                                Flashcards
                            </h2>

                            <p className="mt-2 text-sm text-gray-500">
                                {flashcards.length} flashcards in this session
                            </p>

                            <div className="mt-5">
                                {flashcards.length === 0 ? (
                                    <p className="text-sm text-gray-500">
                                        No flashcards available.
                                    </p>
                                ) : (
                                    <>
                                        <p className="mb-4 text-sm text-gray-600">
                                            Review all flashcards to complete this activity.
                                        </p>

                                        {session.flashcardCompleted ? (
                                            <p className="mb-3 font-semibold text-green-600">
                                                ✓ Flashcards completed
                                            </p>
                                        ) : null}

                                        <button
                                            type="button"
                                            onClick={() => setShowFlashcards(true)}
                                            className="w-full rounded-lg bg-[#2D4030] px-4 py-3 font-semibold text-white hover:bg-[#243629]"
                                        >
                                            {session.flashcardCompleted
                                                ? "Review Flashcards Again"
                                                : "Review Flashcards"}
                                        </button>
                                    </>
                                )}
                            </div>
                        </section>
                    </div>
                )}

            </div>
            {selectedQuiz && (
                <QuizAssessment
                    quiz={selectedQuiz}
                    onClose={() => setSelectedQuiz(null)}
                    onPassed={handleQuizPassed}

                />
                )}
        </DashboardLayout>
    );
}
