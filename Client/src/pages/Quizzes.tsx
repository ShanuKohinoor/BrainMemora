
import { useEffect, useMemo, useState } from "react";
import {
  Brain,
  Plus,
  ArrowRight,
  ArrowLeft,
  Trash2,
  ClipboardList,
  ClipboardCheck,
  CircleHelp,
  X,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  History,
  Layers,
} from "lucide-react";

import QuizAssessment from "../components/QuizAssessment";
import { DashboardLayout } from "../components/DashboardLayout";

import {
  getAllQuizzes,
  deleteQuiz,
  generateQuizQuestions,
  createQuiz,
  showQuizResult,
  getQuizHistory,
  deleteQuizAttempt,
  deleteSelectedQuizAttempts,
} from "../services/quizService";

import type { Quiz } from "../types/quiz.types";
import type { QuizResult } from "../types/quizResult.types";

import { useAppDispatch, useAppSelector } from "../app/hooks";
import { fetchLearningMaterials } from "../features/learningMaterials/learningMaterialSlice";
import type { MaterialType } from "../types/learningMaterial.types";

// One title can contain one or more saved quizzes.
type QuizTitleSet = {
  key: string;
  title: string;
  quizzes: Quiz[];
};

// Each topic contains separate title-based quiz sets.
type QuizTopicSet = {
  topic: string;
  titleSets: QuizTitleSet[];
};

// Describe the learning material information used on this page.
type MaterialForQuiz = {
  _id?: string;
  id?: string;
  topic: string;
  title: string;
  type: MaterialType;
};

const cardColors = ["#A7C1D0", "#D9A399", "#F2D69B", "#B5CDA8"];

// Display the Quiz Center page.
export default function QuizPage() {
  const dispatch = useAppDispatch();

  // Get learning materials from Redux.
  const materials = useAppSelector(
    (state) => state.learningMaterials.materials
  ) as MaterialForQuiz[];

  // Store saved quizzes and loading states.
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Store the ID of the quiz being deleted.
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Store the quiz selected for deletion.
  const [quizToDelete, setQuizToDelete] = useState<Quiz | null>(null);

  // Check if a new quiz is generating.
  const [isGenerating, setIsGenerating] = useState(false);

  // Store the ID of the selected quiz.
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);

  // Store the index of the currently displayed question.
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Store the selected answer for each question.
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);

  // Check whether the quiz has been finished.
  const [isQuizFinished, setIsQuizFinished] = useState(false);

  // Store the quiz result received from the backend.
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

  // Store all attempts for the selected quiz.
  const [quizHistory, setQuizHistory] = useState<QuizResult[]>([]);

  // Check whether quiz history should be displayed.
  const [showQuizHistory, setShowQuizHistory] = useState(false);

  // Store the IDs of selected quiz attempts.
  const [selectedAttemptIds, setSelectedAttemptIds] = useState<string[]>([]);

  // Store the attempts selected for deletion.
  const [attemptsToDelete, setAttemptsToDelete] = useState<string[]>([]);

  // Check whether quiz attempts are being deleted.
  const [isDeletingAttempts, setIsDeletingAttempts] = useState(false);

  // Check whether the user is viewing a previous quiz result.
  const [isViewingHistoryResult, setIsViewingHistoryResult] = useState(false);

  // Check whether quiz history is loading.
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  // Control the quiz generation modal.
  const [showGenerationForm, setShowGenerationForm] = useState(false);

  // Store the selected topics, titles and material types.
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedTitles, setSelectedTitles] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<MaterialType[]>([]);

  // Control the dropdown lists.
  const [showTopicOptions, setShowTopicOptions] = useState(false);
  const [showTitleOptions, setShowTitleOptions] = useState(false);
  const [showTypeOptions, setShowTypeOptions] = useState(false);

  // Store the requested number of questions.
  const [numberOfQuestions, setNumberOfQuestions] = useState(5);

  // Display feedback messages.
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Control the reusable quiz assessment component.
  const [showQuizAssessment, setShowQuizAssessment] = useState(false);

  // Load saved quizzes and learning materials.
  useEffect(() => {
    const loadQuizzes = async () => {
      try {
        const savedQuizzes = await getAllQuizzes();
        setQuizzes(savedQuizzes as Quiz[]);
      } catch {
        setErrorMessage("Failed to load saved quizzes. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    loadQuizzes();
    dispatch(fetchLearningMaterials());
  }, [dispatch]);

  // Get unique topic names from all learning materials.
  const availableTopics = useMemo(
    () =>
      [...new Set(materials.map((material) => material.topic).filter(Boolean))],
    [materials]
  );

  // Get materials that belong to the selected topics.
  const topicMaterials = useMemo(
    () =>
      materials.filter((material) =>
        selectedTopics.includes(material.topic)
      ),
    [materials, selectedTopics]
  );

  // Get unique titles from the selected topics.
  const availableTitles = useMemo(
    () => [
      ...new Set(
        topicMaterials.map((material) => material.title).filter(Boolean)
      ),
    ],
    [topicMaterials]
  );

  // Get materials that match the selected titles.
  const titleMaterials = useMemo(
    () =>
      topicMaterials.filter((material) =>
        selectedTitles.includes(material.title)
      ),
    [topicMaterials, selectedTitles]
  );

  // Get unique material types from the selected titles.
  const availableTypes = useMemo(
    () => [...new Set(titleMaterials.map((material) => material.type))],
    [titleMaterials]
  );

  // Filter materials according to the selected types.
  // If no type is selected, include all available types.
  const selectedMaterials = useMemo(
    () =>
      titleMaterials.filter(
        (material) =>
          selectedTypes.length === 0 ||
          selectedTypes.includes(material.type)
      ),
    [titleMaterials, selectedTypes]
  );

  // Group saved quizzes first by topic and then by title.
  const quizSets: QuizTopicSet[] = useMemo(() => {
    const groupedQuizzes: QuizTopicSet[] = [];

    quizzes.forEach((quiz) => {
      const topic = quiz.topic?.trim() || "General";
      const title = quiz.title?.trim() || "Untitled Quiz";

      // Find the topic group.
      let topicSet = groupedQuizzes.find(
        (item) => item.topic === topic
      );

      // Create the topic group if it does not exist.
      if (!topicSet) {
        topicSet = {
          topic,
          titleSets: [],
        };

        groupedQuizzes.push(topicSet);
      }

      // Find the title group inside the topic.
      let titleSet = topicSet.titleSets.find(
        (item) => item.title === title
      );

      // Create the title group if it does not exist.
      if (!titleSet) {
        titleSet = {
          key: JSON.stringify([topic, title]),
          title,
          quizzes: [],
        };

        topicSet.titleSets.push(titleSet);
      }

      // Add this quiz to its title group.
      titleSet.quizzes.push(quiz);
    });

    // Sort topics and titles alphabetically.
    groupedQuizzes.sort((a, b) =>
      a.topic.localeCompare(b.topic)
    );

    groupedQuizzes.forEach((topicSet) => {
      topicSet.titleSets.sort((a, b) =>
        a.title.localeCompare(b.title)
      );
    });

    return groupedQuizzes;
  }, [quizzes]);

  // Find the quiz selected by the user.
  const selectedQuiz = quizzes.find(
    (quiz) => quiz._id === selectedQuizId
  );

  // Get the question currently displayed.
  const currentQuestion = selectedQuiz?.questions[currentQuestionIndex];

  // Calculate the percentage for a quiz attempt.
  const getPercentage = (attempt: QuizResult) => {
    return attempt.totalQuestions > 0
      ? Math.round((attempt.score / attempt.totalQuestions) * 100)
      : 0;
  };

  // Find the attempt with the highest percentage.
  const bestAttempt = quizHistory.reduce<QuizResult | null>(
    (best, attempt) => {
      if (!best || getPercentage(attempt) > getPercentage(best)) {
        return attempt;
      }

      return best;
    },
    null
  );

  // Store the selected answer for the current question.
  const handleSelectAnswer = (answer: string) => {
    setSelectedAnswers((current) => {
      const updatedAnswers = [...current];
      updatedAnswers[currentQuestionIndex] = answer;

      return updatedAnswers;
    });
  };

  // Start a quiz from the first question.
  const handleStartQuiz = (quizId: string) => {
    setSelectedQuizId(quizId);
    setShowQuizAssessment(true);

    setCurrentQuestionIndex(0);
    setSelectedAnswers([]);
    setIsQuizFinished(false);
    setQuizResult(null);
    setQuizHistory([]);
    setSelectedAttemptIds([]);
    setShowQuizHistory(false);
    setIsViewingHistoryResult(false);
  };

  // Load all attempts for the selected quiz.
  const handleViewHistory = async (quizId: string) => {
    setShowQuizAssessment(false);
    setErrorMessage("");
    setQuizHistory([]);
    setSelectedAttemptIds([]);
    setSelectedQuizId(quizId);
    setIsQuizFinished(false);
    setQuizResult(null);
    setShowQuizHistory(true);
    setIsViewingHistoryResult(false);
    setIsHistoryLoading(true);

    try {
      const history = await getQuizHistory(quizId);
      setQuizHistory(history);
    } catch {
      setErrorMessage("Failed to load quiz history. Please try again.");
    } finally {
      setIsHistoryLoading(false);
    }
  };

  // Open the confirmation dialog for one attempt.
  const handleDeleteAttempt = (attemptId: string) => {
    setAttemptsToDelete([attemptId]);
  };

  // Select or unselect one attempt.
  const handleSelectAttempt = (attemptId: string) => {
    setSelectedAttemptIds((previous) =>
      previous.includes(attemptId)
        ? previous.filter((id) => id !== attemptId)
        : [...previous, attemptId]
    );
  };

  // Select all attempts or clear the selection.
  const handleSelectAllAttempts = () => {
    if (selectedAttemptIds.length === quizHistory.length) {
      setSelectedAttemptIds([]);
    } else {
      setSelectedAttemptIds(
        quizHistory.map((attempt) => attempt._id)
      );
    }
  };

  // Open the confirmation dialog for selected attempts.
  const handleDeleteSelectedAttempts = () => {
    if (selectedAttemptIds.length === 0) return;

    setAttemptsToDelete([...selectedAttemptIds]);
  };

  // Delete the attempts after confirmation.
  const confirmDeleteAttempts = async () => {
    if (attemptsToDelete.length === 0) return;

    const attemptIds = [...attemptsToDelete];

    setIsDeletingAttempts(true);
    setErrorMessage("");

    try {
      if (attemptIds.length === 1) {
        await deleteQuizAttempt(attemptIds[0]);
      } else {
        await deleteSelectedQuizAttempts(attemptIds);
      }

      // Remove deleted attempts from the history list.
      setQuizHistory((previous) =>
        previous.filter(
          (attempt) => !attemptIds.includes(attempt._id)
        )
      );

      // Clear the selected attempts.
      setSelectedAttemptIds([]);
      setAttemptsToDelete([]);
    } catch {
      setErrorMessage("Failed to delete quiz attempts. Please try again.");
    } finally {
      setIsDeletingAttempts(false);
    }
  };

  // Open the result of a previous attempt.
  const handleViewAttemptResult = (attempt: QuizResult) => {
    setQuizResult(attempt);
    setIsQuizFinished(true);
    setShowQuizHistory(false);
    setIsViewingHistoryResult(true);
  };

  // Return to the quiz history list.
  const handleBackToHistory = () => {
    setQuizResult(null);
    setIsQuizFinished(false);
    setShowQuizHistory(true);
    setIsViewingHistoryResult(false);
  };

  // Move to the previous question.
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((current) => current - 1);
    }
  };

  // Move to the next question.
  const handleNextQuestion = () => {
    if (
      selectedQuiz &&
      currentQuestionIndex < selectedQuiz.questions.length - 1
    ) {
      setCurrentQuestionIndex((current) => current + 1);
    }
  };

  // Finish the quiz and show the result.
  const handleFinishQuiz = async () => {
    if (!selectedQuiz) return;

    try {
      const response = await showQuizResult(
        selectedQuiz._id,
        selectedAnswers
      );

      setQuizResult(response.data);
      setIsQuizFinished(true);
    } catch {
      setErrorMessage("Failed to submit Quiz result");
    }
  };

  // Return to the saved quiz list.
  const handleExitQuiz = () => {
    setSelectedQuizId(null);
    setShowQuizAssessment(false);
    setCurrentQuestionIndex(0);
    setSelectedAnswers([]);
    setIsQuizFinished(false);
    setQuizResult(null);
    setQuizHistory([]);
    setSelectedAttemptIds([]);
    setShowQuizHistory(false);
    setIsViewingHistoryResult(false);
  };

  // Retry the same quiz with fresh answers.
  const handleRetryQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers([]);
    setIsQuizFinished(false);
    setQuizResult(null);
    setErrorMessage("");
    setIsViewingHistoryResult(false);
    setShowQuizHistory(false);
  };

  // Open the generation modal and clear previous messages.
  const openGenerationForm = () => {
    setErrorMessage("");
    setSuccessMessage("");
    setShowGenerationForm(true);
  };

  // Close the modal and reset the selections.
  const closeGenerationForm = () => {
    if (isGenerating) return;

    setShowGenerationForm(false);
    setSelectedTopics([]);
    setSelectedTitles([]);
    setSelectedTypes([]);
    setNumberOfQuestions(5);
    setShowTopicOptions(false);
    setShowTitleOptions(false);
    setShowTypeOptions(false);
    setErrorMessage("");
  };

  // Add or remove a topic from the selection.
  const toggleTopic = (topic: string) => {
    setSelectedTopics((current) =>
      current.includes(topic)
        ? current.filter((item) => item !== topic)
        : [...current, topic]
    );

    setSelectedTitles([]);
    setSelectedTypes([]);
  };

  // Add or remove a title from the selection.
  const toggleTitle = (title: string) => {
    setSelectedTitles((current) =>
      current.includes(title)
        ? current.filter((item) => item !== title)
        : [...current, title]
    );

    setSelectedTypes([]);
  };

  // Add or remove a material type from the selection.
  const toggleType = (type: MaterialType) => {
    setSelectedTypes((current) =>
      current.includes(type)
        ? current.filter((item) => item !== type)
        : [...current, type]
    );
  };

  // Generate and save a quiz from the selected materials.
  const handleGenerateQuiz = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (selectedTopics.length === 0) {
      setErrorMessage("Please select at least one topic.");
      return;
    }

    if (selectedTitles.length === 0) {
      setErrorMessage("Please select at least one material title.");
      return;
    }

    if (selectedMaterials.length === 0) {
      setErrorMessage("No materials match your selections.");
      return;
    }

    setIsGenerating(true);

    try {
      // Get the database IDs of the selected materials.
      const materialIds = selectedMaterials
        .map((material) => material._id || material.id)
        .filter((id): id is string => Boolean(id));

      // Make sure every selected material has an ID.
      if (materialIds.length !== selectedMaterials.length) {
        setErrorMessage(
          "Some selected materials have no valid ID. Please refresh and try again."
        );
        return;
      }

      // Ask the backend to extract text and generate questions.
      const questions = await generateQuizQuestions(
        materialIds,
        numberOfQuestions
      );

      // Check whether the backend generated any questions.
      if (!questions || questions.length === 0) {
        setErrorMessage("No questions were generated. Please try again.");
        return;
      }

      // Save the quiz and link its source materials.
      const savedQuiz = await createQuiz({
        topic: selectedTopics.join(", "),
        title:
          selectedTitles.length === 1
            ? selectedTitles[0]
            : `${selectedTitles.length} selected materials`,
        sources: selectedMaterials.map((material) => ({
          sourceType: "learningMaterial" as const,
          sourceId: material._id || material.id || "",
        })),
        questions,
      });

      // Add the new quiz to the saved quiz list.
      setQuizzes((current) => [
        savedQuiz as Quiz,
        ...current,
      ]);

      setSuccessMessage("Quiz generated successfully!");
      setShowGenerationForm(false);
      setSelectedTopics([]);
      setSelectedTitles([]);
      setSelectedTypes([]);
      setNumberOfQuestions(5);
      setShowTopicOptions(false);
      setShowTitleOptions(false);
      setShowTypeOptions(false);
    } catch(error) {
        console.error("Quiz generation error:", error);
      setErrorMessage("Failed to generate the quiz. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Open the delete confirmation dialog.
  const handleDeleteQuiz = (quiz: Quiz) => {
    setQuizToDelete(quiz);
  };

  // Delete the quiz after confirmation.
  const confirmDeleteQuiz = async () => {
    if (!quizToDelete?._id) return;

    const quizId = quizToDelete._id;

    setDeletingId(quizId);
    setErrorMessage("");

    try {
      await deleteQuiz(quizId);

      setQuizzes((current) =>
        current.filter((item) => item._id !== quizId)
      );

      setQuizToDelete(null);
    } catch {
      setErrorMessage("Failed to delete the quiz. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <DashboardLayout
      backLabel="Back to Library"
      backTo="/allLearningMaterials"
    >
      <main className="min-h-screen bg-[#FDF3EC] px-4 py-6 text-[#2D4030] sm:px-6 lg:px-8">

        {/* Page heading and compact Generate Quiz card */}
        <header className="mb-8">
          <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-2">

            {/* Left side: Page heading */}
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] text-[#71806D]">
                LEARN * TEST * IMPROVE
              </p>

              <h1 className="mt-2 text-2xl font-bold leading-tight sm:text-3xl">
                Test Your Knowledge
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#74675F] sm:text-base">
                Test your understanding with quizzes created from your
                learning materials.
              </p>
            </div>

            {/* Right side: Generate Quiz card */}
            <section className="mt-2 w-full max-w-[300px] justify-self-end rounded-2xl border border-[#E6D7CA] bg-white p-4 shadow-sm">

              {/* Quiz illustration */}
              <div className="mb-3 flex h-16 items-center justify-center">
                <div className="relative flex h-16 w-20 items-center justify-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#A7C1D0] shadow-sm">
                    <ClipboardCheck
                      size={30}
                      strokeWidth={1.7}
                      className="text-[#2D4030]"
                    />
                  </div>

                  <div className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[#F27A58]">
                    <CircleHelp
                      size={17}
                      strokeWidth={2}
                      className="text-white"
                    />
                  </div>
                </div>
              </div>

              <h2 className="text-base font-bold">
                Create a Quiz
              </h2>

              <p className="mt-1 text-xs leading-5 text-[#6B7568]">
                Choose your learning materials and create a quiz.
              </p>

              <button
                type="button"
                onClick={openGenerationForm}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#F27A58] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#df6948]"
              >
                <Plus size={15} />
                Generate Quiz
              </button>
            </section>
          </div>
        </header>

        {/* Show page messages */}
        {errorMessage && !showGenerationForm && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
            {successMessage}
          </div>
        )}

        {/* Saved quizzes grouped by topic */}
        <section className="min-w-0">
          {!selectedQuiz || showQuizAssessment ? (
            <>
              <div className="mb-5">
                <div className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-[#F27A58]" />

                  <h2 className="text-lg font-semibold sm:text-xl">
                    Your Quiz Sets
                  </h2>
                </div>

                <p className="mt-1 text-sm leading-6 text-[#74675F]">
                  Choose a topic and select a quiz to start.
                </p>
              </div>

              {isLoading ? (
                <div className="rounded-xl border border-[#E6D7CA] bg-white p-5 text-sm text-[#74675F]">
                  Loading your quizzes...
                </div>
              ) : quizSets.length === 0 ? (
                <div className="rounded-2xl border border-[#E6D7CA] bg-white p-6 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#D9A399]">
                    <ClipboardList size={23} />
                  </div>

                  <h3 className="font-semibold">No quizzes yet</h3>

                  <p className="mt-2 text-sm leading-6 text-[#74675F]">
                    Generate your first quiz to begin testing your knowledge.
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  {quizSets.map((topicSet, index) => {
                    const topicColor =
                      cardColors[index % cardColors.length];

                    // Get all quizzes belonging to this topic.
                    const topicQuizzes = topicSet.titleSets.flatMap(
                      (titleSet) => titleSet.quizzes
                    );

                    return (
                      <section
                        key={topicSet.topic}
                        className="overflow-hidden rounded-2xl border border-[#E6D7CA] bg-white shadow-sm"
                      >
                        {/* Topic heading */}
                        <div className="flex items-center justify-between gap-3 border-b border-[#E6D7CA] bg-[#F9F5EF] px-4 py-4 sm:px-5">
                          <div className="flex min-w-0 items-center gap-3">
                            <div
                              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                              style={{ backgroundColor: topicColor }}
                            >
                              <Layers size={22} />
                            </div>

                            <div className="min-w-0">
                              <h3 className="truncate text-base font-bold sm:text-lg">
                                {topicSet.topic}
                              </h3>

                              <p className="mt-0.5 text-xs text-[#74675F]">
                                {topicQuizzes.length}{" "}
                                {topicQuizzes.length === 1
                                  ? "quiz"
                                  : "quizzes"}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Display all quizzes directly inside the topic */}
                        <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3 sm:p-5">
                          {topicQuizzes.map((quiz, quizIndex) => {
                            const quizId = quiz._id;

                            // Select a background colour for each quiz card.
                            const quizColor =
                              cardColors[quizIndex % cardColors.length];

                            return (
                              <article
                                key={
                                  quizId ||
                                  `${quiz.topic}-${quiz.title}`
                                }
                                className="flex flex-col justify-between rounded-xl border border-[#E6D7CA] p-4 transition hover:border-[#A3B19B] hover:shadow-sm"
                                style={{ backgroundColor: quizColor }}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex min-w-0 items-start gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#FDF3EC]">
                                      <Brain className="h-5 w-5 text-[#F27A58]" />
                                    </div>

                                    <div className="min-w-0">
                                      <h4 className="break-words text-sm font-semibold text-[#2D4030]">
                                        {quiz.title || "Untitled Quiz"}
                                      </h4>

                                      <p className="mt-1 text-xs text-[#6B7568]">
                                        {quiz.questions?.length || 0}{" "}
                                        {quiz.questions?.length === 1
                                          ? "question"
                                          : "questions"}
                                      </p>
                                    </div>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleDeleteQuiz(quiz)
                                    }
                                    disabled={
                                      !quizId ||
                                      deletingId === quizId
                                    }
                                    aria-label="Delete quiz"
                                    className="shrink-0 rounded-lg p-2 text-[#8A6F65] transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>

                                {/* Quiz actions */}
                                <div className="mt-4 flex justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleViewHistory(quizId)
                                    }
                                    disabled={!quizId}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#D8C8BA] bg-white px-3 py-2 text-sm font-semibold text-[#2D4030] transition hover:bg-[#FDF3EC] disabled:opacity-50"
                                  >
                                    <History className="h-4 w-4" />
                                    History
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleStartQuiz(quizId)
                                    }
                                    disabled={!quizId}
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#2D4030] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#df6948] disabled:opacity-50"
                                  >
                                    Start
                                    <ArrowRight className="h-4 w-4" />
                                  </button>
                                </div>
                              </article>
                            );
                          })}
                        </div>
                      </section>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <div className="rounded-2xl border border-[#E9DED4] bg-white p-5 shadow-sm sm:p-7">
              {/* Display the history of the selected quiz */}
              {showQuizHistory ? (
                <>
                  <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-bold">Quiz History</h2>

                      <p className="mt-1 text-sm text-[#6B7568]">
                        {selectedQuiz.title}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleExitQuiz}
                      className="inline-flex items-center gap-2 rounded-lg border border-[#D8C8BA] px-3 py-2 text-sm font-medium transition hover:bg-[#FDF3EC]"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back to Quizzes
                    </button>
                  </div>

                  {isHistoryLoading ? (
                    <div className="rounded-xl border border-[#E9DED4] bg-[#FDF3EC] p-6 text-center text-sm text-[#6B7568]">
                      Loading quiz history...
                    </div>
                  ) : quizHistory.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-[#D8C8BA] p-8 text-center">
                      <History className="mx-auto mb-3 h-10 w-10 text-[#A3B19B]" />

                      <h3 className="font-semibold">No attempts yet</h3>

                      <p className="mt-2 text-sm text-[#6B7568]">
                        Start this quiz to create your first attempt.
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Display the best quiz attempt */}
                      {bestAttempt && (
                        <div className="mb-6 rounded-xl bg-[#FDF3EC] p-5">
                          <p className="text-sm font-semibold text-[#6B7568]">
                            Best Score
                          </p>

                          <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
                            <p className="text-3xl font-bold text-[#F27A58]">
                              {bestAttempt.score} / {bestAttempt.totalQuestions}
                            </p>

                            <p className="text-lg font-semibold text-[#2D4030]">
                              {getPercentage(bestAttempt)}%
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Select and delete quiz attempts */}
                      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
                          <input
                            type="checkbox"
                            checked={
                              quizHistory.length > 0 &&
                              selectedAttemptIds.length === quizHistory.length
                            }
                            onChange={handleSelectAllAttempts}
                            className="h-4 w-4 accent-[#F27A58]"
                          />
                          Select All
                        </label>

                        <button
                          type="button"
                          onClick={handleDeleteSelectedAttempts}
                          disabled={selectedAttemptIds.length === 0}
                          className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete Selected ({selectedAttemptIds.length})
                        </button>
                      </div>

                      {/* Display all attempts */}
                      <div className="space-y-4">
                        {quizHistory.map((attempt, index) => (
                          <article
                            key={attempt._id}
                            className="rounded-xl border border-[#E9DED4] p-4 sm:p-5"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div className="flex items-start gap-3">
                                <input
                                  type="checkbox"
                                  checked={selectedAttemptIds.includes(
                                    attempt._id
                                  )}
                                  onChange={() =>
                                    handleSelectAttempt(attempt._id)
                                  }
                                  aria-label={`Select attempt ${quizHistory.length - index}`}
                                  className="mt-1 h-4 w-4 accent-[#F27A58]"
                                />

                                <div>
                                  <h3 className="font-semibold">
                                    Attempt {quizHistory.length - index}
                                  </h3>

                                  <p className="mt-1 text-sm text-[#6B7568]">
                                    {new Date(
                                      attempt.completedAt
                                    ).toLocaleString()}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                <div className="text-right">
                                  <p className="font-bold text-[#2D4030]">
                                    {attempt.score} / {attempt.totalQuestions}
                                  </p>

                                  <p className="mt-1 text-sm text-[#6B7568]">
                                    {getPercentage(attempt)}% correct
                                  </p>
                                </div>

                                {/* Delete this individual attempt */}
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDeleteAttempt(attempt._id)
                                  }
                                  aria-label="Delete this attempt"
                                  title="Delete attempt"
                                  className="rounded-lg p-2 text-[#8A6F65] transition hover:bg-red-50 hover:text-red-600"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>

                            <div className="mt-4 flex justify-end">
                              <button
                                type="button"
                                onClick={() =>
                                  handleViewAttemptResult(attempt)
                                }
                                className="inline-flex items-center gap-2 rounded-lg bg-[#2D4030] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#3c5540]"
                              >
                                View Results
                                <ArrowRight className="h-4 w-4" />
                              </button>
                            </div>
                          </article>
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : !isQuizFinished ? (
                <>
                  {/* Quiz heading */}
                  <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-bold">
                        {selectedQuiz.title}
                      </h2>

                      <p className="mt-1 text-sm text-[#6B7568]">
                        Question {currentQuestionIndex + 1} of{" "}
                        {selectedQuiz.questions.length}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleExitQuiz}
                      className="rounded-lg border border-[#D8C8BA] px-3 py-2 text-sm font-medium transition hover:bg-[#FDF3EC]"
                    >
                      Exit Quiz
                    </button>
                  </div>

                  {/* Question progress */}
                  <div className="mb-7 h-2 overflow-hidden rounded-full bg-[#F1E8E0]">
                    <div
                      className="h-full rounded-full bg-[#F27A58] transition-all"
                      style={{
                        width: `${
                          ((currentQuestionIndex + 1) /
                            selectedQuiz.questions.length) *
                          100
                        }%`,
                      }}
                    />
                  </div>

                  {currentQuestion ? (
                    <>
                      {/* Display the current question */}
                      <h3 className="mb-6 text-lg font-semibold leading-7">
                        {currentQuestion.question}
                      </h3>

                      {/* Display the answer options */}
                      <div className="space-y-3">
                        {currentQuestion.options.map((option, index) => {
                          const isSelected =
                            selectedAnswers[currentQuestionIndex] === option;

                          return (
                            <button
                              key={`${option}-${index}`}
                              type="button"
                              onClick={() => handleSelectAnswer(option)}
                              className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left text-sm transition ${
                                isSelected
                                  ? "border-[#F27A58] bg-[#FFF1EB] font-semibold"
                                  : "border-[#E9DED4] hover:border-[#F27A58] hover:bg-[#FDF8F4]"
                              }`}
                            >
                              <span
                                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                                  isSelected
                                    ? "bg-[#F27A58] text-white"
                                    : "bg-[#F1E8E0] text-[#2D4030]"
                                }`}
                              >
                                {String.fromCharCode(65 + index)}
                              </span>

                              <span>{option}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Question navigation buttons */}
                      <div className="mt-8 flex items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={handlePreviousQuestion}
                          disabled={currentQuestionIndex === 0}
                          className="rounded-lg border border-[#D8C8BA] px-4 py-2.5 text-sm font-semibold transition hover:bg-[#FDF3EC] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Previous
                        </button>

                        {currentQuestionIndex ===
                        selectedQuiz.questions.length - 1 ? (
                          <button
                            type="button"
                            onClick={handleFinishQuiz}
                            disabled={!selectedAnswers[currentQuestionIndex]}
                            className="rounded-lg bg-[#2D4030] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3c5540] disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Finish Quiz
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={handleNextQuestion}
                            disabled={!selectedAnswers[currentQuestionIndex]}
                            className="inline-flex items-center gap-2 rounded-lg bg-[#F27A58] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#df6948] disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Next
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-[#6B7568]">
                      This quiz does not contain any questions
                    </p>
                  )}
                </>
              ) : (
                <>
                  {/* Quiz result */}
                  <div className="py-8 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#FDF3EC]">
                      <ClipboardCheck
                        size={34}
                        className="text-[#F27A58]"
                      />
                    </div>

                    <h2 className="text-2xl font-bold">
                      {isViewingHistoryResult
                        ? "Previous Quiz Result"
                        : "Quiz Completed!"}
                    </h2>

                    <p className="mt-2 text-sm text-[#6B7568]">
                      {isViewingHistoryResult
                        ? `Reviewing a previous attempt of ${selectedQuiz.title}`
                        : `You have completed ${selectedQuiz.title}`}
                    </p>

                    <div className="mx-auto mt-7 max-w-xs rounded-xl bg-[#FDF3EC] p-6">
                      <p className="text-sm text-[#6B7568]">
                        {isViewingHistoryResult
                          ? "Attempt Score"
                          : "Your Score"}
                      </p>

                      <p className="mt-2 text-4xl font-bold text-[#F27A58]">
                        {quizResult?.score ?? 0} /{" "}
                        {quizResult?.totalQuestions ?? 0}
                      </p>

                      <p className="mt-2 text-sm text-[#6B7568]">
                        {quizResult && quizResult.totalQuestions > 0
                          ? getPercentage(quizResult)
                          : 0}
                        % correct answers
                      </p>
                    </div>
                  </div>

                  {/* Review the answers after completing the quiz */}
                  <div className="mt-6">
                    <h3 className="mb-4 text-xl font-bold">
                      Review Your Answers
                    </h3>

                    <div className="space-y-5">
                      {quizResult?.answers.map((answer, index) => (
                        <div
                          key={`${index}-${answer.question}`}
                          className="rounded-xl border border-[#E9DED4] p-4 sm:p-5"
                        >
                          <h4 className="mb-4 font-semibold leading-6">
                            {index + 1}. {answer.question}
                          </h4>

                          {/* Show the answer selected by the user */}
                          <div
                            className={`rounded-lg border p-3 ${
                              answer.isCorrect
                                ? "border-green-200 bg-green-50"
                                : "border-red-200 bg-red-50"
                            }`}
                          >
                            <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7568]">
                              Your answer
                            </p>

                            <p
                              className={`mt-1 text-sm font-semibold ${
                                answer.isCorrect
                                  ? "text-green-700"
                                  : "text-red-700"
                              }`}
                            >
                              {answer.selectedAnswer}
                            </p>
                          </div>

                          {/* Show the correct answer when the selected answer is wrong */}
                          {!answer.isCorrect && (
                            <div className="mt-3 rounded-lg border border-green-200 bg-green-50 p-3">
                              <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
                                Correct answer
                              </p>

                              <p className="mt-1 text-sm font-semibold text-green-700">
                                {answer.correctAnswer}
                              </p>
                            </div>
                          )}

                          {/* Show the explanation below the answers */}
                          {answer.explanation && (
                            <div className="mt-4 rounded-lg bg-[#FDF3EC] p-3">
                              <p className="text-sm font-semibold text-[#2D4030]">
                                Explanation
                              </p>

                              <p className="mt-1 text-sm leading-6 text-[#6B7568]">
                                {answer.explanation}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Retry and exit buttons */}
                  <div className="mt-7 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={
                        isViewingHistoryResult
                          ? handleBackToHistory
                          : handleExitQuiz
                      }
                      className="inline-flex items-center gap-2 rounded-lg bg-[#2D4030] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#3c5540]"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      {isViewingHistoryResult
                        ? "Back to History"
                        : "Back to Quiz"}
                    </button>

                    {!isViewingHistoryResult && (
                      <button
                        type="button"
                        onClick={handleRetryQuiz}
                        aria-label="Retry quiz"
                        title="Retry quiz"
                        className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-[#D8C8BA] text-[#2D4030] transition hover:bg-[#FDF3EC]"
                      >
                        <RotateCcw className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </section>

        {/* Reusable quiz assessment */}
        {showQuizAssessment && selectedQuiz && (
          <QuizAssessment
            quiz={selectedQuiz}
            onClose={handleExitQuiz}
            onPassed={() => {}}
          />
        )}

        {/* Delete quiz confirmation dialog */}
        {quizToDelete && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#2D4030]/60 p-4">
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-quiz-title"
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2
                    id="delete-quiz-title"
                    className="text-xl font-bold text-[#2D4030]"
                  >
                    Delete Quiz?
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-[#6B7568]">
                    Are you sure you want to delete{" "}
                    <strong>
                      {quizToDelete.title || "Untitled Quiz"}
                    </strong>
                    ? This action cannot be undone.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setQuizToDelete(null)}
                  disabled={deletingId === quizToDelete._id}
                  aria-label="Close confirmation"
                  className="rounded-lg p-2 text-[#6B7568] hover:bg-[#FDF3EC] disabled:opacity-50"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setQuizToDelete(null)}
                  disabled={deletingId === quizToDelete._id}
                  className="rounded-lg border border-[#D8C8BA] px-4 py-2 text-sm font-semibold text-[#2D4030] hover:bg-[#FDF3EC] disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={confirmDeleteQuiz}
                  disabled={deletingId === quizToDelete._id}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {deletingId === quizToDelete._id
                    ? "Deleting..."
                    : "Delete"}
                </button>
              </div>
            </section>
          </div>
        )}

        {/* Delete quiz attempts confirmation dialog */}
        {attemptsToDelete.length > 0 && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#2D4030]/60 p-4">
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-attempts-title"
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2
                    id="delete-attempts-title"
                    className="text-xl font-bold text-[#2D4030]"
                  >
                    Delete Quiz Attempts?
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-[#6B7568]">
                    Are you sure you want to delete{" "}
                    <strong>
                      {attemptsToDelete.length === 1
                        ? "this attempt"
                        : `${attemptsToDelete.length} selected attempts`}
                    </strong>
                    ? This action cannot be undone.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setAttemptsToDelete([])}
                  disabled={isDeletingAttempts}
                  aria-label="Close confirmation"
                  className="rounded-lg p-2 text-[#6B7568] hover:bg-[#FDF3EC] disabled:opacity-50"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setAttemptsToDelete([])}
                  disabled={isDeletingAttempts}
                  className="rounded-lg border border-[#D8C8BA] px-4 py-2 text-sm font-semibold text-[#2D4030] hover:bg-[#FDF3EC] disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={confirmDeleteAttempts}
                  disabled={isDeletingAttempts}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {isDeletingAttempts ? "Deleting..." : "Delete"}
                </button>
              </div>
            </section>
          </div>
        )}

        {/* Quiz generation form */}
        {showGenerationForm && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#2D4030]/60 p-3 sm:p-5"
            onMouseDown={(event) => {
              // Close the modal when the user clicks outside it.
              if (
                event.target === event.currentTarget &&
                !isGenerating
              ) {
                closeGenerationForm();
              }
            }}
          >
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="quiz-generation-title"
              className="my-auto w-full max-w-2xl rounded-2xl bg-white p-4 shadow-2xl sm:p-6"
            >
              {/* Modal heading */}
              <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                  <h2
                    id="quiz-generation-title"
                    className="text-xl font-bold"
                  >
                    Generate Quiz
                  </h2>

                  <p className="mt-1 text-sm text-[#6B7568]">
                    Select the materials you want to use.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeGenerationForm}
                  disabled={isGenerating}
                  aria-label="Close form"
                  className="rounded-lg p-2 text-[#6B7568] transition hover:bg-[#FDF3EC] disabled:opacity-50"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Display form errors */}
              {errorMessage && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {errorMessage}
                </div>
              )}

              {/* Use two columns on wider screens */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                {/* Topic selection */}
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Topics
                  </label>

                  <button
                    type="button"
                    onClick={() =>
                      setShowTopicOptions((current) => !current)
                    }
                    aria-expanded={showTopicOptions}
                    className="flex w-full items-center justify-between rounded-lg border border-[#D8C8BA] px-3 py-2.5 text-left text-sm outline-none focus:border-[#F27A58]"
                  >
                    <span>
                      {selectedTopics.length
                        ? `${selectedTopics.length} topic(s) selected`
                        : "Select topics"}
                    </span>

                    {showTopicOptions ? (
                      <ChevronUp size={17} />
                    ) : (
                      <ChevronDown size={17} />
                    )}
                  </button>

                  {showTopicOptions && (
                    <div className="mt-2 max-h-40 space-y-2 overflow-y-auto rounded-lg border border-[#E9DED4] p-3">
                      {availableTopics.length === 0 ? (
                        <p className="text-sm text-[#6B7568]">
                          No learning topics available.
                        </p>
                      ) : (
                        availableTopics.map((topic) => (
                          <label
                            key={topic}
                            className="flex cursor-pointer items-center gap-2 text-sm"
                          >
                            <input
                              type="checkbox"
                              checked={selectedTopics.includes(topic)}
                              onChange={() => toggleTopic(topic)}
                              disabled={isGenerating}
                              className="accent-[#F27A58]"
                            />
                            <span className="break-words">{topic}</span>
                          </label>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Material title selection */}
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Material Titles
                  </label>

                  <button
                    type="button"
                    disabled={selectedTopics.length === 0 || isGenerating}
                    onClick={() =>
                      setShowTitleOptions((current) => !current)
                    }
                    aria-expanded={showTitleOptions}
                    className="flex w-full items-center justify-between rounded-lg border border-[#D8C8BA] px-3 py-2.5 text-left text-sm outline-none focus:border-[#F27A58] disabled:bg-gray-100 disabled:text-gray-400"
                  >
                    <span>
                      {selectedTitles.length
                        ? `${selectedTitles.length} title(s) selected`
                        : "Select titles"}
                    </span>

                    {showTitleOptions ? (
                      <ChevronUp size={17} />
                    ) : (
                      <ChevronDown size={17} />
                    )}
                  </button>

                  {showTitleOptions && (
                    <div className="mt-2 max-h-40 space-y-2 overflow-y-auto rounded-lg border border-[#E9DED4] p-3">
                      {availableTitles.length === 0 ? (
                        <p className="text-sm text-[#6B7568]">
                          No titles available for these topics.
                        </p>
                      ) : (
                        availableTitles.map((title) => (
                          <label
                            key={title}
                            className="flex cursor-pointer items-center gap-2 text-sm"
                          >
                            <input
                              type="checkbox"
                              checked={selectedTitles.includes(title)}
                              onChange={() => toggleTitle(title)}
                              disabled={isGenerating}
                              className="accent-[#F27A58]"
                            />
                            <span className="break-words">{title}</span>
                          </label>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Material type selection */}
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Material Types
                  </label>

                  <button
                    type="button"
                    disabled={selectedTitles.length === 0 || isGenerating}
                    onClick={() =>
                      setShowTypeOptions((current) => !current)
                    }
                    aria-expanded={showTypeOptions}
                    className="flex w-full items-center justify-between rounded-lg border border-[#D8C8BA] px-3 py-2.5 text-left text-sm outline-none focus:border-[#F27A58] disabled:bg-gray-100 disabled:text-gray-400"
                  >
                    <span>
                      {selectedTypes.length
                        ? `${selectedTypes.length} type(s) selected`
                        : "Select material types"}
                    </span>

                    {showTypeOptions ? (
                      <ChevronUp size={17} />
                    ) : (
                      <ChevronDown size={17} />
                    )}
                  </button>

                  {showTypeOptions && (
                    <div className="mt-2 max-h-40 space-y-2 overflow-y-auto rounded-lg border border-[#E9DED4] p-3">
                      {availableTypes.length === 0 ? (
                        <p className="text-sm text-[#6B7568]">
                          No material types available.
                        </p>
                      ) : (
                        availableTypes.map((type) => (
                          <label
                            key={type}
                            className="flex cursor-pointer items-center gap-2 text-sm"
                          >
                            <input
                              type="checkbox"
                              checked={selectedTypes.includes(type)}
                              onChange={() => toggleType(type)}
                              disabled={isGenerating}
                              className="accent-[#F27A58]"
                            />
                            <span>{type}</span>
                          </label>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Choose the requested question count */}
                <div>
                  <label
                    htmlFor="numberOfQuestions"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Number of Questions
                  </label>

                  <select
                    id="numberOfQuestions"
                    value={numberOfQuestions}
                    onChange={(event) =>
                      setNumberOfQuestions(Number(event.target.value))
                    }
                    disabled={isGenerating}
                    className="w-full rounded-lg border border-[#D8C8BA] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#F27A58] disabled:bg-gray-100"
                  >
                    {[5, 10, 15, 20].map((count) => (
                      <option key={count} value={count}>
                        {count} questions
                      </option>
                    ))}
                  </select>
                </div>

                {/* Show how many materials match the selections */}
                <p className="text-xs text-[#6B7568] sm:col-span-2">
                  {selectedMaterials.length} matching material(s) selected.
                </p>
              </div>

              {/* Modal action buttons */}
              <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeGenerationForm}
                  disabled={isGenerating}
                  className="rounded-lg border border-[#D8C8BA] px-4 py-2 text-sm font-semibold transition hover:bg-[#FDF3EC] disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleGenerateQuiz}
                  disabled={
                    isGenerating ||
                    selectedTopics.length === 0 ||
                    selectedTitles.length === 0 ||
                    selectedMaterials.length === 0
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#F27A58] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#df6948] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <ClipboardCheck className="h-4 w-4" />
                  {isGenerating ? "Generating..." : "Generate Quiz"}
                </button>
              </div>
            </section>
          </div>
        )}
      </main>
    </DashboardLayout>
  );
}
