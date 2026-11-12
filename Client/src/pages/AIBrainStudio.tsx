
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
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

import { useAppDispatch, useAppSelector } from "../app/hooks";
import { fetchLearningMaterials } from "../features/learningMaterials/learningMaterialSlice";
import {
    generateAIContent,
    generatePromptAI,
    getAIHistory
} from "../services/aiService";


type Action = "flashcards" | "quiz" | "summarise" | "explain";
type Tab = "create" | "prompt" | "history";

// Describes one AI generation history record
interface AIHistoryItem {
    _id: string;
    mode: "create" | "prompt";
    action: string;
    topic?: string;
    title?: string;
    prompt?: string;
    content: string;
    createdAt: string;
}

// Available AI generation actions
const actions = [
    { id: "flashcards", label: "Flashcards", icon: Layers },
    { id: "quiz", label: "Quiz", icon: FileQuestion },
    { id: "summarise", label: "Summarise", icon: BookOpen },
    { id: "explain", label: "Explain", icon: Lightbulb },
] as const;

export default function AIBrainStudio() {
    const dispatch = useAppDispatch();

    // Get saved learning materials from Redux.
    const materials = useAppSelector(
        (state) => state.learningMaterials.materials
    );

    // Control the active tab and selected AI action
    const [activeTab, setActiveTab] = useState<Tab>("create");
    const [action, setAction] = useState<Action>("flashcards");

    // Settings for Create with AI
    const [topic, setTopic] = useState("");
    const [concept, setConcept] = useState("");
    const [difficulty, setDifficulty] = useState("Medium");
    const [level, setLevel] = useState("Beginner");
    const [count, setCount] = useState("10");

    // User's prompt
    const [prompt, setPrompt] = useState("");

    // Track whether Prompt AI needs permission to use general knowledge
    const [needsPermission, setNeedsPermission] = useState(false);

    // Message displayed for validation or feedback
    const [message, setMessage] = useState("");

    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedContent, setGeneratedContent] = useState("");

    // AI generation history
    const [history, setHistory] = useState<AIHistoryItem[]>([]);

    // Track which history item is currently expanded
    const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null);

    // Fetch the user's AI generation history from the backend.
    async function loadAIHistory() {
        try {
            const response = await getAIHistory();

            setHistory(response.history);
        } catch (error) {
            console.error("Failed to fetch AI history:", error);
            setMessage("Failed to load AI history. Please try again.");
        }
    }

    // Fetch learning materials when the page loads
    useEffect(() => {
        dispatch(fetchLearningMaterials());
    }, [dispatch]);

    // Fetch AI history when the user opens the History tab.
    useEffect(() => {
        if (activeTab === "history") {
            loadAIHistory();
        }
    }, [activeTab]);

    // Get unique topics from saved learning materials
    const materialTopics = Array.from(
        new Set(
            materials
                .filter(
                    (material) =>
                        material._id && material.topic?.trim()
                )
                .map((material) => material.topic.trim())
        )
    ).sort();

    // Get materials belonging to the selected topic
    const materialsForTopic = materials.filter(
        (material) =>
            material.topic?.trim() === topic
    );

    // Get unique titles belonging to the selected topic
    const materialTitles = Array.from(
        new Set(
            materialsForTopic
                .map((material) => material.title.trim())
                .filter(Boolean)
        )
    ).sort();

    // Validate and prepare the structured AI generation request
    async function handleCreate() {
        setMessage("");
        setGeneratedContent("");

        if (
            (action === "flashcards" || action === "quiz") &&
            (!Number.isInteger(Number(count)) ||
                Number(count) < 1 ||
                Number(count) > 50)
        ) {
            setMessage("Enter a number between 1 and 50.");
            return;
        }

        try {
            setIsGenerating(true);

            const response = await generateAIContent({
                action,
                topic,
                title: concept || undefined,
                difficulty,
                level,
                count: Number(count)
            });

            console.log("AI generation response:", response);

            if (action === "summarise" || action === "explain") {
                setGeneratedContent(response.content);
            }

            setMessage("AI content generated successfully!");
        } catch (error) {
            console.error("AI generation failed:", error);
            setMessage("Failed to generate AI content. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    }

    // Generate AI content using the user's custom prompt
    async function handlePromptGenerate(allowGeneralAnswer = false) {
        setMessage("");
        setGeneratedContent("");

        if (!prompt.trim()) {
            setMessage("Please enter your prompt.");
            return;
        }

        try {
            setIsGenerating(true);

            const response = await generatePromptAI({
                prompt,
                allowGeneralAnswer
            });

            console.log("Prompt AI response:", response);

            if (response.needsPermission) {
                setNeedsPermission(true);
                setMessage(
                    "No relevant saved learning material was found. Would you like to use general knowledge instead?"
                );
                return;
            }

            setNeedsPermission(false);

            if (response.action === "flashcards" || response.action === "quiz") {
                setMessage(response.message);
                return;
            }

            setGeneratedContent(response.content);
            setMessage("AI content generated successfully!");
        } catch (error) {
            console.error("Prompt AI generation failed:", error);
            setMessage("Failed to generate AI content. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    }

    // Change tabs and clear previous messages
    function changeTab(tab: Tab) {
        setActiveTab(tab);
        setMessage("");
        setNeedsPermission(false);
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

                {/* Main navigation tabs */}
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

                        {/* Choose the type of content to generate */}
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
                                                setGeneratedContent("");
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

                        {/* Generation settings */}
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

                                {/* Select a learning topic */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Topic
                                    </label>

                                    <select
                                        value={topic}
                                        onChange={(e) => {
                                            setTopic(e.target.value);
                                            setConcept("");
                                            setMessage("");
                                            setGeneratedContent("");
                                        }}
                                        className="w-full rounded-lg border border-gray-200 bg-white p-3 text-sm outline-none focus:border-[#F27A58]"
                                    >
                                        <option value="">
                                            All topics
                                        </option>

                                        {materialTopics.map((item) => (
                                            <option key={item} value={item}>
                                                {item}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Select a title belonging to the chosen topic */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Title
                                    </label>

                                    <select
                                        value={concept}
                                        disabled={!topic}
                                        onChange={(e) => {
                                            setConcept(e.target.value);
                                            setMessage("");
                                            setGeneratedContent("");
                                        }}
                                        className="w-full rounded-lg border border-gray-200 bg-white p-3 text-sm outline-none focus:border-[#F27A58] disabled:bg-gray-100"
                                    >
                                        <option value="">
                                            {topic
                                                ? "All titles"
                                                : "Select a topic first"}
                                        </option>

                                        {materialTitles.map((title) => (
                                            <option key={title} value={title}>
                                                {title}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Select generation difficulty */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Difficulty
                                    </label>

                                    <select
                                        value={difficulty}
                                        onChange={(e) =>
                                            setDifficulty(e.target.value)
                                        }
                                        className="w-full rounded-lg border border-gray-200 p-3 text-sm outline-none focus:border-[#F27A58]"
                                    >
                                        <option>Easy</option>
                                        <option>Medium</option>
                                        <option>Hard</option>
                                    </select>
                                </div>

                                {/* Select the learner's knowledge level */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Learner level
                                    </label>

                                    <select
                                        value={level}
                                        onChange={(e) =>
                                            setLevel(e.target.value)
                                        }
                                        className="w-full rounded-lg border border-gray-200 p-3 text-sm outline-none focus:border-[#F27A58]"
                                    >
                                        <option>Beginner</option>
                                        <option>Intermediate</option>
                                        <option>Advanced</option>
                                    </select>
                                </div>

                                {/* Select the number of flashcards or quiz questions */}
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
                                            onChange={(e) =>
                                                setCount(e.target.value)
                                            }
                                            className="w-full rounded-lg border border-gray-200 p-3 text-sm outline-none focus:border-[#F27A58]"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Display validation or feedback message */}
                            {message && (
                                <p className="text-sm text-[#2D4030]">
                                    {message}
                                </p>
                            )}

                            {/* Display generated summary or explanation */}
                            {generatedContent && (
                                <div className="rounded-xl border border-gray-200 bg-[#FDF3EC] p-5">
                                    <h3 className="mb-4 font-semibold text-[#2D4030]">
                                        {action === "summarise" ? "Summary" : "Explanation"}
                                    </h3>

                                    <div className="space-y-3 text-sm leading-7 text-gray-700 [&_h1]:text-xl [&_h1]:font-bold [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:font-semibold [&_li]:ml-5 [&_li]:list-disc [&_ol]:list-decimal [&_p]:mb-3 [&_strong]:font-semibold [&_ul]:space-y-1">
                                        <ReactMarkdown>
                                            {generatedContent}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={handleCreate}
                                disabled={isGenerating}
                                className="ml-auto mb-2 flex w-fit items-center justify-center gap-2 rounded-lg bg-[#F27A58] px-6 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <Sparkles size={17} />
                                {isGenerating ? "Generating..." : "Generate with AI"}
                            </button>
                        </section>
                    </div>
                )}

                {/* Prompt AI */}
                {activeTab === "prompt" && (
                    <div className="mb-2 space-y-5 rounded-xl border border-gray-200 bg-white p-5">

                        <div>
                            <h3 className="font-semibold text-[#2D4030]">
                                What would you like AI to do?
                            </h3>

                            <p className="mt-1 text-sm text-gray-500">
                                Describe what you want in your own words.
                            </p>
                        </div>

                        {/* Enter a custom AI prompt */}
                        <textarea
                            value={prompt}
                            onChange={(e) => {
                                setPrompt(e.target.value);
                                setMessage("");
                                setNeedsPermission(false);
                            }}
                            rows={7}
                            placeholder="Example: From my React learning materials, focus on useEffect and generate 10 beginner-friendly flashcards with practical examples..."
                            className="w-full resize-y rounded-xl border border-gray-200 p-4 text-sm outline-none focus:border-[#F27A58]"
                        />

                        <p className="text-xs text-gray-500">
                            You can request flashcards, quizzes, summaries or explanations based on your saved learning materials.
                        </p>

                        {/* Display validation or feedback message */}
                        {message && (
                            <p className="text-sm text-[#2D4030]">
                                {message}
                            </p>
                        )}

                        {/* Ask permission to use general knowledge */}
                        {needsPermission && (
                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={() => handlePromptGenerate(true)}
                                    disabled={isGenerating}
                                    className="rounded-lg bg-[#2D4030] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                                >
                                    Use general knowledge
                                </button>

                                <button
                                    onClick={() => {
                                        setNeedsPermission(false);
                                        setMessage("");
                                    }}
                                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}

                        {/* Display generated AI response */}
                        {generatedContent && (
                            <div className="rounded-xl border border-gray-200 bg-[#FDF3EC] p-5">
                                <h3 className="mb-4 font-semibold text-[#2D4030]">
                                    AI Response
                                </h3>

                                <div className="space-y-3 text-sm leading-7 text-gray-700 [&_h1]:text-xl [&_h1]:font-bold [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:font-semibold [&_li]:ml-5 [&_li]:list-disc [&_ol]:list-decimal [&_p]:mb-3 [&_strong]:font-semibold [&_ul]:space-y-1">
                                    <ReactMarkdown>
                                        {generatedContent}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={()=>handlePromptGenerate()}
                            disabled={isGenerating}
                            className="ml-auto flex w-fit items-center justify-center gap-2 rounded-lg bg-[#F27A58] px-6 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <Sparkles size={17} />
                            {isGenerating ? "Generating..." : "Generate with AI"}
                        </button>
                    </div>
                )}

                {/* AI generation history */}
                {activeTab === "history" && (
                    <div className="space-y-3">

                        {history.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-gray-300 bg-white px-5 py-16 text-center">
                                <Clock
                                    className="mx-auto mb-3 text-gray-400"
                                    size={30}
                                />

                                <h3 className="font-semibold text-[#2D4030]">
                                    No AI generations yet
                                </h3>
                            </div>
                        ) : (
                            history.map((item) => (
                                <div
                                    key={item._id}
                                    className="overflow-hidden rounded-xl border border-gray-200 bg-white"
                                >
                                    {/* Clickable history heading */}
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setExpandedHistoryId(
                                                expandedHistoryId === item._id
                                                    ? null
                                                    : item._id
                                            )
                                        }
                                        className="flex w-full items-center justify-between gap-3 p-5 text-left transition hover:bg-gray-50"
                                    >
                                        <div className="min-w-0 space-y-1">
                                            <h3 className="break-words font-semibold capitalize text-[#2D4030]">
                                                {item.mode === "prompt"
                                                    ? item.prompt
                                                    : `${item.action}${item.topic ? ` - ${item.topic}` : ""}`}
                                            </h3>

                                            <p className="text-xs text-gray-400">
                                                {item.mode === "create"
                                                    ? "Create with AI"
                                                    : "Prompt AI"}
                                                {" · "}
                                                {new Date(item.createdAt).toLocaleString()}
                                            </p>
                                        </div>

                                        <span className="shrink-0 text-lg text-gray-500">
                                            {expandedHistoryId === item._id
                                                ? "−"
                                                : "+"}
                                        </span>
                                    </button>

                                    {/* History details - displayed only when clicked */}
                                    {expandedHistoryId === item._id && (
                                        <div className="space-y-4 border-t border-gray-100 p-5">

                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="rounded-full bg-[#FDF3EC] px-3 py-1 text-xs font-medium capitalize text-[#2D4030]">
                                                    {item.mode === "create"
                                                        ? "Create with AI"
                                                        : "Prompt AI"}
                                                </span>

                                                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium capitalize text-gray-600">
                                                    {item.action}
                                                </span>
                                            </div>

                                            {item.topic && (
                                                <div>
                                                    <p className="mb-1 text-sm font-medium text-gray-700">
                                                        Topic
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        {item.topic}
                                                    </p>
                                                </div>
                                            )}

                                            {item.title && (
                                                <div>
                                                    <p className="mb-1 text-sm font-medium text-gray-700">
                                                        Title
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        {item.title}
                                                    </p>
                                                </div>
                                            )}

                                            {item.prompt && (
                                                <div>
                                                    <p className="mb-1 text-sm font-medium text-gray-700">
                                                        Your prompt
                                                    </p>
                                                    <p className="whitespace-pre-wrap break-words text-sm text-gray-600">
                                                        {item.prompt}
                                                    </p>
                                                </div>
                                            )}

                                            <div>
                                                <p className="mb-2 text-sm font-medium text-gray-700">
                                                    Generated content
                                                </p>

                                                <div className="rounded-lg bg-[#FDF3EC] p-4">
                                                    <div className="whitespace-pre-wrap break-words text-sm leading-7 text-gray-700">
                                                        {item.content}
                                                    </div>
                                                </div>
                                            </div>

                                            <p className="flex items-center gap-2 text-xs text-gray-400">
                                                <Clock size={14} />
                                                {new Date(item.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}

            </div>
        </DashboardLayout>
    );
}
