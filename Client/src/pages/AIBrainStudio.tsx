
import { useState } from "react";
import { DashboardLayout } from "../components/DashboardLayout";
import {
    Sparkles,
    Layers,
    FileQuestion,
    BookOpen,
    Lightbulb,
    History,
    SlidersHorizontal,
    MessageSquareText,
    Clock,
} from "lucide-react";

type Action = "flashcards" | "quiz" | "summarise" | "explain";
type Tab = "create" | "prompt" | "history";

const actions = [
    { id: "flashcards", label: "Flashcards", icon: Layers },
    { id: "quiz", label: "Quiz", icon: FileQuestion },
    { id: "summarise", label: "Summarise", icon: BookOpen },
    { id: "explain", label: "Explain", icon: Lightbulb },
] as const;

export default function AIBrainStudio() {
    const [activeTab, setActiveTab] = useState<Tab>("create");
    const [action, setAction] = useState<Action>("flashcards");

    // Structured generation
    const [topic, setTopic] = useState("");
    const [concept, setConcept] = useState("");
    const [difficulty, setDifficulty] = useState("Medium");
    const [level, setLevel] = useState("Beginner");
    const [count, setCount] = useState("10");

    // Prompt generation
    const [prompt, setPrompt] = useState("");

    const [message, setMessage] = useState("");

    function handleCreate() {
        if (!topic.trim()) {
            setMessage("Please enter a topic.");
            return;
        }

        if (
            (action === "flashcards" || action === "quiz") &&
            (!Number.isInteger(Number(count)) ||
                Number(count) < 1 ||
                Number(count) > 50)
        ) {
            setMessage("Enter a number between 1 and 50.");
            return;
        }

        setMessage("Your AI generation request is ready. Gemini will be connected next.");
    }

    function handlePromptGenerate() {
        if (!prompt.trim()) {
            setMessage("Please enter your prompt.");
            return;
        }

        setMessage("Your AI prompt is ready. Gemini will be connected next.");
    }

    function changeTab(tab: Tab) {
        setActiveTab(tab);
        setMessage("");
    }

    return (
        <DashboardLayout backLabel="Back to Dashboard" backTo="/dashboard">
            <div className="mx-auto max-w-4xl space-y-6">

                {/* Page heading */}
                <div>
                    <p className="mt-1 text-lg text-gray-500">
                        Create personalised learning content with AI.
                    </p>
                </div>

                {/* Main tabs */}
                <div className="grid grid-cols-3 gap-2 rounded-xl bg-gray-100 p-1">
                    <button
                        onClick={() => changeTab("create")}
                        className={`flex items-center justify-center gap-2 rounded-lg px-2 py-3 text-sm font-medium transition ${
                            activeTab === "create"
                                ? "bg-white text-[#2D4030] shadow-sm"
                                : "text-gray-500 hover:text-[#2D4030]"
                        }`}
                    >
                        <SlidersHorizontal size={17} />
                        <span>Create with AI</span>
                    </button>

                    <button
                        onClick={() => changeTab("prompt")}
                        className={`flex items-center justify-center gap-2 rounded-lg px-2 py-3 text-sm font-medium transition ${
                            activeTab === "prompt"
                                ? "bg-white text-[#2D4030] shadow-sm"
                                : "text-gray-500 hover:text-[#2D4030]"
                        }`}
                    >
                        <MessageSquareText size={17} />
                        <span>Prompt AI</span>
                    </button>

                    <button
                        onClick={() => changeTab("history")}
                        className={`flex items-center justify-center gap-2 rounded-lg px-2 py-3 text-sm font-medium transition ${
                            activeTab === "history"
                                ? "bg-white text-[#2D4030] shadow-sm"
                                : "text-gray-500 hover:text-[#2D4030]"
                        }`}
                    >
                        <History size={17} />
                        <span>History</span>
                    </button>
                </div>

                {/* Create with AI */}
                {activeTab === "create" && (
                    <div className="space-y-6">

                        <section className="space-y-3">
                            <h3 className="font-semibold text-[#2D4030]">
                                Choose what to create
                            </h3>

                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                {actions.map((item) => {
                                    const Icon = item.icon;

                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => {
                                                setAction(item.id);
                                                setMessage("");
                                            }}
                                            className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-sm font-medium transition ${
                                                action === item.id
                                                    ? "border-[#F27A58] bg-[#FDF3EC] text-[#2D4030]"
                                                    : "border-gray-200 bg-white text-gray-600 hover:border-[#F27A58]"
                                            }`}
                                        >
                                            <Icon size={22} />
                                            {item.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </section>

                        <section className="space-y-4 rounded-xl border border-gray-200 bg-white p-5">
                            <div>
                                <h3 className="font-semibold text-[#2D4030]">
                                    Generation settings
                                </h3>
                                <p className="mt-1 text-xs text-gray-500">
                                    Choose your learning preferences.
                                </p>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Topic
                                    </label>
                                    <input
                                        value={topic}
                                        onChange={(e) => setTopic(e.target.value)}
                                        placeholder="e.g. React"
                                        className="w-full rounded-lg border border-gray-200 p-3 text-sm outline-none focus:border-[#F27A58]"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Specific concept
                                    </label>
                                    <input
                                        value={concept}
                                        onChange={(e) => setConcept(e.target.value)}
                                        placeholder="e.g. useEffect"
                                        className="w-full rounded-lg border border-gray-200 p-3 text-sm outline-none focus:border-[#F27A58]"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Difficulty
                                    </label>
                                    <select
                                        value={difficulty}
                                        onChange={(e) => setDifficulty(e.target.value)}
                                        className="w-full rounded-lg border border-gray-200 p-3 text-sm outline-none focus:border-[#F27A58]"
                                    >
                                        <option>Easy</option>
                                        <option>Medium</option>
                                        <option>Hard</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Learner level
                                    </label>
                                    <select
                                        value={level}
                                        onChange={(e) => setLevel(e.target.value)}
                                        className="w-full rounded-lg border border-gray-200 p-3 text-sm outline-none focus:border-[#F27A58]"
                                    >
                                        <option>Beginner</option>
                                        <option>Intermediate</option>
                                        <option>Advanced</option>
                                    </select>
                                </div>

                                {(action === "flashcards" || action === "quiz") && (
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">
                                            Number of {action === "quiz" ? "questions" : "cards"}
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="50"
                                            value={count}
                                            onChange={(e) => setCount(e.target.value)}
                                            className="w-full rounded-lg border border-gray-200 p-3 text-sm outline-none focus:border-[#F27A58]"
                                        />
                                    </div>
                                )}
                            </div>
                        </section>

                        {message && (
                            <p className="text-sm text-[#2D4030]">{message}</p>
                        )}

                        <button
                            onClick={handleCreate}
                            className="ml-auto flex w-fit items-center justify-center gap-2  mb-2 rounded-lg bg-[#F27A58] px-6 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
                        >
                            <Sparkles size={17} />
                            Generate with AI
                        </button>
                    </div>
                )}

                {/* Prompt AI */}
                {activeTab === "prompt" && (
                    <div className="space-y-5 rounded-xl border border-gray-200 bg-white mb-2 p-5">
                        <div>
                            <h3 className="font-semibold text-[#2D4030]">
                                What would you like AI to do?
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Describe what you want in your own words.
                            </p>
                        </div>

                        <textarea
                            value={prompt}
                            onChange={(e) => {
                                setPrompt(e.target.value);
                                setMessage("");
                            }}
                            rows={7}
                            placeholder="Example: From my React topic, focus on useEffect and generate 10 beginner-friendly flashcards with practical examples..."
                            className="w-full resize-y rounded-xl border border-gray-200 p-4 text-sm outline-none focus:border-[#F27A58]"
                        />

                        <p className="text-xs text-gray-500">
                            You can request flashcards, quizzes, summaries or explanations.
                        </p>

                        {message && (
                            <p className="text-sm text-[#2D4030]">{message}</p>
                        )}

                        <button
                            onClick={handlePromptGenerate}
                            className="ml-auto flex w-fit items-center justify-center gap-2 rounded-lg bg-[#F27A58] px-6 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
                        >
                            <Sparkles size={17} />
                            Generate with AI
                        </button>
                    </div>
                )}

                {/* History */}
                {activeTab === "history" && (
                    <div className="rounded-xl border border-dashed border-gray-300 bg-white px-5 py-16 text-center">
                        <Clock className="mx-auto mb-3 text-gray-400" size={30} />

                        <h3 className="font-semibold text-[#2D4030]">
                            No AI generations yet
                        </h3>

                        <p className="mt-2 text-sm text-gray-500">
                            Your AI-generated flashcards, quizzes, summaries and explanations will appear here.
                        </p>
                    </div>
                )}

            </div>
        </DashboardLayout>
    );
}
