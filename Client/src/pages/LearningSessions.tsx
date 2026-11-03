
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";

import { DashboardLayout } from "../components/DashboardLayout";
import {
    createLearningSessions,
    getLearningSessions
} from "../services/learningSessionService";
import type { LearningSession } from "../types/learningSession.types";

export default function LearningSession() {
    const location = useLocation();
    const navigate = useNavigate();

    // Get the selected topic from the Materials page
    const topic = location.state?.topic as string | undefined;

    // Store learning sessions
    const [sessions, setSessions] = useState<LearningSession[]>([]);

    // Store loading and error states
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    // Create and fetch sessions
    useEffect(() => {
        const fetchSessions = async () => {
            if (!topic) {
                setError("No topic was selected.");
                return;
            }

            try {
                setIsLoading(true);
                setError("");

                // Create sessions if they do not exist
                await createLearningSessions(topic);

                // Fetch all sessions for this topic
                const data = await getLearningSessions(topic);

                setSessions(data);

            } catch (error) {
                console.error("Error loading learning sessions:", error);
                setError("Unable to load learning sessions. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchSessions();
    }, [topic]);

    // Open the selected learning session
    const handleStartSession = (sessionId: string) => {
        navigate(`/learningSessionDetails/${sessionId}`);
    };

    return (
        <DashboardLayout>
            <div className="p-6">

                {/* Page heading */}
                <div className="mb-6">
                    <button
                        type="button"
                        onClick={() => navigate("/materials")}
                        className="mb-4 text-sm font-medium text-[#2D4030] hover:underline"
                    >
                         Back to Materials
                    </button>

                    <h1 className="text-2xl font-bold text-[#2D4030]">
                        Learning Sessions
                    </h1>

                    <p className="mt-2 text-gray-600">
                        Continue your learning journey, one session at a time.
                    </p>

                    {topic && (
                        <p className="mt-3 text-sm font-medium text-[#B85F45]">
                            Topic: {topic}
                        </p>
                    )}
                </div>

                {/* Loading message */}
                {isLoading && (
                    <p className="py-8 text-center text-gray-500">
                        Loading learning sessions...
                    </p>
                )}

                {/* Error message */}
                {!isLoading && error && (
                    <p className="rounded-lg bg-red-50 p-4 text-red-600">
                        {error}
                    </p>
                )}

                {/* Empty message */}
                {!isLoading && !error && sessions.length === 0 && (
                    <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
                        <h2 className="text-lg font-semibold text-[#2D4030]">
                            No learning sessions found
                        </h2>

                        <p className="mt-2 text-sm text-gray-500">
                            There are no learning sessions available for this topic yet.
                        </p>
                    </div>
                )}

                {/* Display learning sessions */}
                {!isLoading && !error && sessions.length > 0 && (
                    <div className="grid gap-4 md:grid-cols-2">

                        {sessions.map((session) => (
                            <div
                                key={session._id}
                                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                            >
                                <div className="flex items-start justify-between gap-3">

                                    <div>
                                        <p className="text-xs font-medium text-gray-500">
                                            SESSION {session.order}
                                        </p>

                                        <h2 className="mt-2 text-lg font-semibold text-[#2D4030]">
                                            {session.title}
                                        </h2>

                                        <p className="mt-2 text-sm text-gray-600">
                                            {session.description || "No description available."}
                                        </p>
                                    </div>

                                    {/* Session status */}
                                    <span
                                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                                            session.isCompleted
                                                ? "bg-green-100 text-green-700"
                                                : session.isUnlocked
                                                ? "bg-blue-100 text-blue-700"
                                                : "bg-gray-100 text-gray-600"
                                        }`}
                                    >
                                        {session.isCompleted
                                            ? "Completed"
                                            : session.isUnlocked
                                            ? "Unlocked"
                                            : "Locked"}
                                    </span>
                                </div>

                                {/* Quiz and flashcard counts */}
                                <div className="mt-5 flex gap-4 text-sm text-gray-600">
                                    <p>
                                        Flashcards: {session.flashcardIds.length}
                                    </p>

                                    <p>
                                        Quizzes: {session.quizIds.length}
                                    </p>
                                </div>

                                {/* Start session button */}
                                <button
                                    type="button"
                                    disabled={!session.isUnlocked}
                                    onClick={() => handleStartSession(session._id)}
                                    className="mt-5 w-full rounded-lg bg-[#2D4030] px-4 py-2 text-sm font-medium text-white hover:bg-[#405943] disabled:cursor-not-allowed disabled:bg-gray-300"
                                >
                                    {session.isCompleted
                                        ? "Completed"
                                        : session.isUnlocked
                                        ? "Start Session"
                                        : "Locked"}
                                </button>
                            </div>
                        ))}

                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
