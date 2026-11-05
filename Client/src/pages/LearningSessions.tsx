
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";

import { DashboardLayout } from "../components/DashboardLayout";
import {
    createLearningSessions,
    getLearningSessions
} from "../services/learningSessionService";
import type { LearningSession } from "../types/learningSession.types";

export default function LearningSession() {

        const sessionCardColors = [
            "#F2D69B",
            "#B5CDA8",
            "#A7C1D0",
            "#D9A399",
        ];

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
                try {
                    setIsLoading(true);
                    setError("");

                    // Create sessions only when a specific topic is selected
                    if (topic) {
                        try {
                            await createLearningSessions(topic);
                        } catch (createError: any) {
                            // Ignore duplicate session error
                            if (createError.response?.status !== 409) {
                                throw createError;
                            }
                        }
                    }

                    // Fetch sessions for the selected topic or all topics
                    const data = await getLearningSessions(topic);

                    setSessions(data);

                } catch (error: any) {
                    console.error("Error loading learning sessions:", error);

                    setError(
                        error.response?.data?.message ||
                        "Unable to load learning sessions. Please try again."
                    );

                } finally {
                    setIsLoading(false);
                }
            };

            fetchSessions();

        }, [topic]);

// Group learning sessions by topic
    const groupedSessions = sessions.reduce<Record<string, LearningSession[]>>(
        (groups, session) => {
            if (!groups[session.topic]) {
                groups[session.topic] = [];
            }

            groups[session.topic].push(session);

            return groups;
        },
        {}
    );

    // Open the selected learning session
    const handleStartSession = (sessionId: string) => {
        navigate(`/learningSessionDetails/${sessionId}`);
    };

    return (
            <DashboardLayout backLabel="Back to Library" backTo="/allLearningMaterials">
            
            <div className="p-6">

                {/* Page heading */}
                <div className="mb-6">

                    <h1 className="text-2xl font-bold text-[#2D4030]">
                        Learning Sessions
                    </h1>

                    <p className="mt-2 text-[#80665C]">
                        Continue your learning journey, one session at a time.
                    </p>

                </div>

                {/* Loading message */}
                {isLoading && (
                    <p className="py-8 text-center text-[#80665C]">
                        Loading learning sessions...
                    </p>
                )}

                {/* Error message */}
                {!isLoading && error && (
                    <p className="rounded-lg border border-red-100 bg-red-50 p-4 text-red-600">
                        {error}
                    </p>
                )}

                {/* Empty message */}
                {!isLoading && !error && sessions.length === 0 && (
                    <div className="rounded-xl border border-[#E8DED3] bg-white p-8 text-center">
                        <h2 className="text-lg font-semibold text-[#2D4030]">
                            No learning sessions found
                        </h2>

                        <p className="mt-2 text-sm text-[#80665C]">
                            There are no learning sessions available for this topic yet.
                        </p>
                    </div>
                )}

{/* Display learning sessions grouped by topic */}
{!isLoading && !error && sessions.length > 0 && (
    <div className="space-y-8">
        {Object.entries(groupedSessions).map(([topicName, topicSessions]) => {

            // Calculate topic-level information
            const totalSessions = topicSessions.length;

            const completedSessions = topicSessions.filter(
                (session) => session.isCompleted
            ).length;

            const progress = Math.round(
                (completedSessions / totalSessions) * 100
            );

            const totalFlashcards = topicSessions.reduce(
                (total, session) => total + session.flashcardIds.length,
                0
            );

            const totalQuizzes = topicSessions.reduce(
                (total, session) => total + session.quizIds.length,
                0
            );

            return (
                <div key={topicName} className="rounded-xl border border-[#E8DED3] bg-white p-5 shadow-sm">

                    {/* Topic heading */}
                    <h2 className="text-xl font-bold text-[#2D4030]">
                        {topicName}
                    </h2>

                    {/* Topic-level counts */}
                    <div className="mt-3 flex gap-6 text-sm text-[#80665C]">
                        <p>Flashcards: {totalFlashcards}</p>
                        <p>Quizzes: {totalQuizzes}</p>
                    </div>

                    {/* Overall topic progress */}
                    <div className="mt-5">
                        <div className="mb-2 flex justify-between text-sm">
                            <span className="font-medium text-[#80665C]">
                                Overall Progress
                            </span>
                            <span className="font-semibold text-[#2D4030]">
                                {progress}%
                            </span>
                        </div>

                        <div className="h-2 w-full rounded-full bg-[#E8DED3]">
                            <div
                                className="h-2 rounded-full bg-[#F27A58]"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    {/* Individual sessions */}
                    <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {topicSessions.map((session, index) => (
                            <div
                                key={session._id}
                                className="rounded-xl border border-[#E8DED3] p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                                style={{
                                    backgroundColor: sessionCardColors[index % sessionCardColors.length]
                                }}
                            >
                                <p className="text-xs font-medium text-[#80665C]">
                                    SESSION {session.order}
                                </p>

                                <h3 className="mt-2 font-semibold text-[#2D4030]">
                                    {session.title}
                                </h3>

                                <p className="mt-2 text-sm text-[#80665C]">
                                    {session.description}
                                </p>

                                <span className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-medium ${
                                    session.isCompleted
                                        ? "bg-green-100 text-green-700"
                                        : session.isUnlocked
                                        ? "bg-blue-100 text-blue-700"
                                        : "bg-gray-100 text-gray-600"
                                }`}>
                                    {session.isCompleted
                                        ? "Completed"
                                        : session.isUnlocked
                                        ? "Unlocked"
                                        : "Locked"}
                                </span>

                                <button
                                    type="button"
                                    disabled={!session.isUnlocked}
                                    onClick={() => handleStartSession(session._id)}
                                    className="mt-4 w-full rounded-lg bg-[#2D4030] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#405943] disabled:cursor-not-allowed disabled:bg-gray-300"
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
                </div>
            );
        })}
    </div>
)}
            </div>
        </DashboardLayout>
    );
}
