
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  Brain,
  Plus,
  ArrowRight,
  Trash2,
  ClipboardList,
  ClipboardCheck,
  CircleHelp,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import { DashboardLayout } from "../components/DashboardLayout";
import {
  getAllQuizzes,
  deleteQuiz,
  generateQuizQuestions,
  createQuiz,
} from "../services/quizService";
import type { Quiz } from "../types/quiz.types";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { fetchLearningMaterials } from "../features/learningMaterials/learningMaterialSlice";
import type { MaterialType } from "../types/learningMaterial.types";

// Group saved quizzes by topic
type QuizSet = {
  topic: string;
  quizzes: Quiz[];
};

// Describe the material information used by this page
type MaterialForQuiz = {
  _id?: string;
  id?: string;
  topic: string;
  title: string;
  type: MaterialType;
};

// Display the Quiz Center page
export default function QuizPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Get learning materials from Redux
  const materials = useAppSelector(
    (state) => state.learningMaterials.materials
  ) as MaterialForQuiz[];

  // Store saved quizzes and loading states
  //Store the quizzes already saved by the user
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  // Check if the saved quizzes are loading
  const [isLoading, setIsLoading] = useState(true);
  // Store the ID of the quiz to delete
  const [deletingId, setDeletingId] = useState<string | null>(null);
  //Check if new quiz is generating
  const [isGenerating, setIsGenerating] = useState(false);
  // Which quiz to display
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  // Store the index of which question is currently displayed
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Store the selected answer for each question by user
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);

  // Check whether the quiz has been finished
  const [isQuizFinished, setIsQuizFinished] = useState(false);

  // The generation modal
  const [showGenerationForm, setShowGenerationForm] = useState(false);

  // Store the selected topics, titles, and material types
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedTitles, setSelectedTitles] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<MaterialType[]>([]);

  // Control the dropdown lists
  const [showTopicOptions, setShowTopicOptions] = useState(false);
  const [showTitleOptions, setShowTitleOptions] = useState(false);
  const [showTypeOptions, setShowTypeOptions] = useState(false);

  // Store the requested number of questions
  const [numberOfQuestions, setNumberOfQuestions] = useState(5);

  // Display feedback messages
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Load saved quizzes and learning materials
  useEffect(() => { //This tells React to run this code when the Quiz page loads
    const loadQuizzes = async () => {
      try {
        const savedQuizzes = await getAllQuizzes();
        setQuizzes(savedQuizzes as Quiz[]);
      } catch {
        // Handle errors when loading saved quizzes
        setErrorMessage("Failed to load saved quizzes. Please try again.");
      } finally {
        setIsLoading(false); // Whether the request succeeds or fails,stop the loading state
      }
    };

    loadQuizzes();
    dispatch(fetchLearningMaterials());
  }, [dispatch]);

  // Extracts only the topic names from all materials and removes duplicates
  const availableTopics = useMemo(
    () =>
      [...new Set(materials.map((material) => material.topic).filter(Boolean))],
    [materials] // If materials changes, recalculate availableTopics. Otherwise use the same
  );

  // Get materials that belong to the selected topics
  const topicMaterials = useMemo(
    () =>
      materials.filter((material) =>
        selectedTopics.includes(material.topic)
      ),
    [materials, selectedTopics]
  );

  // Get unique titles from the selected topics
  const availableTitles = useMemo(
    () =>
      [
        ...new Set(
          topicMaterials.map((material) => material.title).filter(Boolean)
        ),
      ],
    [topicMaterials]
  );

  // Get materials that match the selected titles
  const titleMaterials = useMemo(
    () =>
      topicMaterials.filter((material) =>
        selectedTitles.includes(material.title)
      ),
    [topicMaterials, selectedTitles]
  );

  // Get unique material types from the selected titles
  const availableTypes = useMemo(
    () => [...new Set(titleMaterials.map((material) => material.type))],
    [titleMaterials]
  );

  // Filter materials according to the selected types
  const selectedMaterials = useMemo(
    () =>
      titleMaterials.filter(
        (material) =>
          selectedTypes.length === 0 ||
          selectedTypes.includes(material.type)
      ),
    [titleMaterials, selectedTypes]
  );

  // Group saved quizzes by topic.
  const quizSets: QuizSet[] = useMemo(() => {
    const groupedQuizzes: Record<string, Quiz[]> = {};

    quizzes.forEach((quiz) => {
      const topic = quiz.topic || "General";

      if (!groupedQuizzes[topic]) {
        groupedQuizzes[topic] = [];
      }

      groupedQuizzes[topic].push(quiz);
    });

    return Object.entries(groupedQuizzes).map(([topic, topicQuizzes]) => ({
      topic,
      quizzes: topicQuizzes,
    }));
  }, [quizzes]);

  // Find the quiz selected by the user
  const selectedQuiz = quizzes.find(
    (quiz) => quiz._id === selectedQuizId
  );

  // Get the question currently displayed
  const currentQuestion = selectedQuiz?.questions[currentQuestionIndex];

  // Store the selected answer for the current question
  const handleSelectAnswer = (answer: string) => {
    setSelectedAnswers((current) => {
      const updatedAnswers = [...current];
      updatedAnswers[currentQuestionIndex] = answer;

      return updatedAnswers;
    });
  };

  // Start a quiz from the first question
  const handleStartQuiz = (quizId: string) => {
    setSelectedQuizId(quizId);
    setCurrentQuestionIndex(0);
    setSelectedAnswers([]);
    setIsQuizFinished(false);
  };

  // Move to the previous question
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((current) => current - 1);
    }
  };

  // Move to the next question
  const handleNextQuestion = () => {
    if (
      selectedQuiz &&
      currentQuestionIndex < selectedQuiz.questions.length - 1
    ) {
      setCurrentQuestionIndex((current) => current + 1);
    }
  };

  // Finish the quiz and show the result
  const handleFinishQuiz = () => {
    setIsQuizFinished(true);
  };

  // Return to the saved quiz list
  const handleExitQuiz = () => {
    setSelectedQuizId(null);
    setCurrentQuestionIndex(0);
    setSelectedAnswers([]);
    setIsQuizFinished(false);
  };

  // Calculate the number of correct answers
  const score =
    selectedQuiz?.questions.reduce((total, question, index) => {
      return total + (selectedAnswers[index] === question.correctAnswer ? 1 : 0);
    }, 0) || 0;

  // Open the modal and clear previous messages.
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

    // Reset titles and types when the topics change.
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

    // Reset types when the titles change.
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
    } catch {
      setErrorMessage("Failed to generate the quiz. Please try again.");
    } finally {
      // Stop the loading state whether generation succeeds or fails.
      setIsGenerating(false);
    }
  };

  // Delete a saved quiz.
  const handleDeleteQuiz = async (quiz: Quiz) => {
    const quizId = quiz._id;

    if (!quizId) {
      setErrorMessage("This quiz does not have a valid ID.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this quiz?"
    );

    if (!confirmed) return;

    setDeletingId(quizId);
    setErrorMessage("");

    try {
      await deleteQuiz(quizId);

      // Remove the deleted quiz from the page.
      setQuizzes((current) =>
        current.filter((item) => item._id !== quizId)
      );
    } catch {
      setErrorMessage("Failed to delete the quiz. Please try again.");
    } finally {
      // Clear the deleting state after the request finishes.
      setDeletingId(null);
    }
  };

  return (
    <DashboardLayout
      backLabel="Back to Library"
      backTo="/allLearningMaterials"
    >
      <div className="min-h-screen bg-[#FDF3EC] px-4 py-6 text-[#2D4030] sm:px-6">
        {/* Page heading */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mt-1 text-sm text-[#6B7568]">
              Test your knowledge with quizzes created from your learning
              materials
            </p>
          </div>
        </div>

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

        {/* Show the create card and saved quiz sets */}
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          {/* Left side: Create quiz card */}
          <section className="rounded-2xl border border-[#E9DED4] bg-white p-5 shadow-sm">
            {/* Quiz clipboard*/}
            <div className="relative mb-5 flex h-24 w-24 items-center justify-center rounded-2xl bg-[#A7C1D0]">
              {/* Main quiz clipboard */}
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-[#FDF3EC]">
                <ClipboardCheck
                  size={42}
                  strokeWidth={1.7}
                  className="text-[#2D4030]"
                />
              </div>
              {/* Question mark badge */}
              <div className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#FDF3EC] bg-[#F27A58]">
                <CircleHelp
                  size={22}
                  strokeWidth={2}
                  className="text-white"
                />
              </div>
            </div>
            <h2 className="text-lg font-bold">Create a Quiz</h2>

            <p className="mt-2 text-sm leading-6 text-[#6B7568]">
              Choose your learning materials and create a quiz to check your
              understanding
            </p>

            <button
              type="button"
              onClick={openGenerationForm}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-[#2D4030] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#3c5540]"
            >
              <Plus className="h-4 w-4" />
              Generate Quiz
            </button>
          </section>

          {/* Right side: Saved quizzes */}
          <section className="min-w-0">
            {!selectedQuiz ? (
              <>
                <div className="mb-4 flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-[#F27A58]" />

                  <h2 className="text-xl font-bold">Your Quiz Sets</h2>

                  <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-[#2D4030]">
                    {quizzes.length}
                  </span>
                </div>

                {isLoading ? (
                  <div className="rounded-xl border border-[#E9DED4] bg-white p-6 text-sm text-[#6B7568]">
                    Loading your quizzes...
                  </div>
                ) : quizSets.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[#D8C8BA] bg-white p-8 text-center">
                    <ClipboardList className="mx-auto mb-3 h-10 w-10 text-[#A3B19B]" />

                    <h3 className="font-semibold">No quizzes yet</h3>

                    <p className="mt-2 text-sm text-[#6B7568]">
                      Generate your first quiz to see it here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {quizSets.map((set) => (
                      <div key={set.topic}>
                        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-[#6B7568]">
                          {set.topic}
                        </h3>

                        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                          {set.quizzes.map((quiz) => {
                            const quizId = quiz._id;

                            return (
                              <article
                                key={quizId || `${quiz.topic}-${quiz.title}`}
                                className="rounded-xl border border-[#E9DED4] bg-white p-5 shadow-sm transition hover:shadow-md"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex min-w-0 items-start gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#FDF3EC]">
                                      <Brain className="h-5 w-5 text-[#F27A58]" />
                                    </div>

                                    <div className="min-w-0">
                                      <h4 className="break-words font-bold">
                                        {quiz.title || "Untitled Quiz"}
                                      </h4>

                                      <p className="mt-1 text-sm text-[#6B7568]">
                                        {quiz.questions?.length || 0} questions
                                      </p>
                                    </div>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => handleDeleteQuiz(quiz)}
                                    disabled={!quizId || deletingId === quizId}
                                    aria-label="Delete quiz"
                                    className="shrink-0 rounded-lg p-2 text-[#8A6F65] transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>

                                {/* Show the available quiz actions */}
                                <div className="mt-5 flex flex-wrap gap-2">
                                  <button
                                    type="button"
                                    onClick={() => navigate(`/quiz/${quizId}`)}
                                    disabled={!quizId}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#D8C8BA] px-3 py-2 text-sm font-medium transition hover:bg-[#FDF3EC] disabled:opacity-50"
                                  >
                                    View Questions
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleStartQuiz(quizId)}
                                    disabled={!quizId}
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#F27A58] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#df6948] disabled:opacity-50"
                                  >
                                    Start
                                    <ArrowRight className="h-4 w-4" />
                                  </button>
                                </div>
                              </article>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-2xl border border-[#E9DED4] bg-white p-5 shadow-sm sm:p-7">
                {!isQuizFinished ? (
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
                              disabled={
                                !selectedAnswers[currentQuestionIndex]
                              }
                              className="rounded-lg bg-[#2D4030] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3c5540] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Finish Quiz
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={handleNextQuestion}
                              disabled={
                                !selectedAnswers[currentQuestionIndex]
                              }
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

                      <h2 className="text-2xl font-bold">Quiz Completed!</h2>

                      <p className="mt-2 text-sm text-[#6B7568]">
                        You have completed {selectedQuiz.title}
                      </p>

                      <div className="mx-auto mt-7 max-w-xs rounded-xl bg-[#FDF3EC] p-6">
                        <p className="text-sm text-[#6B7568]">
                          Your Score
                        </p>

                        <p className="mt-2 text-4xl font-bold text-[#F27A58]">
                          {score} / {selectedQuiz.questions.length}
                        </p>

                        <p className="mt-2 text-sm text-[#6B7568]">
                          {selectedQuiz.questions.length > 0
                            ? Math.round(
                                (score / selectedQuiz.questions.length) * 100
                              )
                            : 0}
                          % correct answers
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleExitQuiz}
                        className="mt-7 rounded-lg bg-[#2D4030] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#3c5540]"
                      >
                        Back to Quiz Sets
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </section>
        </div>

        {/* Quiz generation modal */}
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
                    Select the materials you want to use
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

              {/* Use two columns on wider screens to keep the modal compact */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Topic selection */}
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Topics
                  </label>

                  <button
                    type="button"
                    onClick={() => setShowTopicOptions((current) => !current)}
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
                          No learning topics available
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
                    disabled={selectedTopics.length === 0}
                    onClick={() => setShowTitleOptions((current) => !current)}
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
                          No titles available for these topics
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
                    disabled={selectedTitles.length === 0}
                    onClick={() => setShowTypeOptions((current) => !current)}
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
                          No material types available
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
                  {selectedMaterials.length} matching material(s) selected
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
                  disabled={isGenerating}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#F27A58] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#df6948] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <ClipboardCheck className="h-4 w-4" />
                  {isGenerating ? "Generating..." : "Generate Quiz"}
                </button>
              </div>
            </section>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
