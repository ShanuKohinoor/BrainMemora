
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

import { DashboardLayout } from "../components/DashboardLayout";

import { getOneLearningSession } from "../services/learningSessionService";

import type { LearningSession } from "../types/learningSession.types";
import type { Quiz } from "../types/quiz.types";
import type { Flashcard } from "../types/flashcard.types";

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
        <DashboardLayout>
            <div className="mx-auto max-w-5xl space-y-8 p-6">

                {/* Session heading */}
                <div>
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="mb-4 text-sm font-medium text-[#2D4030]"
                    >
                        ← Back to Learning Sessions
                    </button>

                    <h1 className="text-3xl font-bold text-[#2D4030]">
                        {session.title}
                    </h1>

                    <p className="mt-2 text-gray-600">
                        {session.description || session.topic}
                    </p>
                </div>

                {/* Flashcards section */}
                <section className="space-y-4">
                    <div>
                        <h2 className="text-2xl font-semibold text-[#2D4030]">
                            Flashcards
                        </h2>
                        <p className="text-sm text-gray-500">
                            {flashcards.length} flashcards in this session
                        </p>
                    </div>

                    {flashcards.length === 0 ? (
                        <p className="rounded-xl bg-white p-5 text-gray-500">
                            No flashcards available.
                        </p>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2">
                            {flashcards.map((card) => (
                                <div
                                    key={card._id}
                                    className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                                >
                                    <h3 className="font-semibold text-[#2D4030]">
                                        {card.question}
                                    </h3>

                                    <div className="mt-4 rounded-lg bg-[#FDF3EC] p-4">
                                        <p className="text-sm font-medium text-[#F27A58]">
                                            Answer
                                        </p>
                                        <p className="mt-1 text-gray-700">
                                            {card.answer}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Quizzes section */}
                <section className="space-y-4">
                    <div>
                        <h2 className="text-2xl font-semibold text-[#2D4030]">
                            Quizzes
                        </h2>
                        <p className="text-sm text-gray-500">
                            {quizzes.length} quizzes in this session
                        </p>
                    </div>

                    {quizzes.length === 0 ? (
                        <p className="rounded-xl bg-white p-5 text-gray-500">
                            No quizzes available.
                        </p>
                    ) : (
                        <div className="space-y-5">
                            {quizzes.map((quiz) => (
                                <div
                                    key={quiz._id}
                                    className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                                >
                                    <h3 className="mb-4 text-lg font-semibold text-[#2D4030]">
                                        {quiz.title}
                                    </h3>

                                    <div className="space-y-5">
                                        {quiz.questions.map((question, index) => (
                                            <div key={index}>
                                                <p className="font-medium text-gray-800">
                                                    {index + 1}. {question.question}
                                                </p>

                                                <div className="mt-3 space-y-2">
                                                    {question.options.map(
                                                        (option, optionIndex) => (
                                                            <div
                                                                key={optionIndex}
                                                                className="rounded-lg bg-gray-50 p-3 text-sm text-gray-700"
                                                            >
                                                                {option}
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

            </div>
        </DashboardLayout>
    );
}
