
import { useEffect, useState, type FormEvent } from "react";
import {
  Plus,
  BookOpen,
  ArrowRight,
  X,
  Layers,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Sparkles,
} from "lucide-react";

import { DashboardLayout } from "../components/DashboardLayout";
import { useAppDispatch, useAppSelector } from "../app/hooks";

import { fetchNotes } from "../features/notes/noteSlice";
import { fetchLearningMaterials } from "../features/learningMaterials/learningMaterialSlice";

import {
  getAllFlashcards,
  createFlashcard,
  deleteFlashcard,
} from "../services/flashCardService";

import type {
  Flashcard,
  FlashcardBody,
} from "../types/flashcard.types";

// A source that the user can select when creating a flashcard.
type SourceOption = {
  id: string;
  title: string;
  topic: string;
  sourceType: "note" | "learningMaterial";
};

// Colors used for the question and answer sides.
const cardColors = [
  "#2D4030",
  "#F27A58",
  "#A3B19B",
  "#FCE6DC",
  "#E8EDE2",
  "#EDE9F5",
];

export default function Flashcards() {
  const dispatch = useAppDispatch();

  // Get notes and learning materials from Redux.
  const notes = useAppSelector((state) => state.notes.notes);
  const materials = useAppSelector(
    (state) => state.learningMaterials.materials
  );

  // Controls the create form.
  const [showForm, setShowForm] = useState(false);

  // Stores the selected source and question-and-answer text.
  const [selectedSourceId, setSelectedSourceId] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  // Stores flashcards retrieved from the backend.
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);

  // Stores the topic currently being studied.
  const [viewTopic, setViewTopic] = useState<string | null>(null);

  // Tracks the current card and which side is visible.
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Controls loading and error messages.
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Load the user's notes, materials and saved flashcards.
  useEffect(() => {
    dispatch(fetchNotes());
    dispatch(fetchLearningMaterials());

    async function loadFlashcards() {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const savedCards = await getAllFlashcards();
        setFlashcards(savedCards ?? []);
      } catch {
        setErrorMessage("Unable to load flashcards. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }

    loadFlashcards();
  }, [dispatch]);

  // Convert existing notes and materials into selectable sources.
  const sources: SourceOption[] = [
    ...notes
      .filter((note) => note._id)
      .map((note) => ({
        id: note._id!,
        title: note.title,
        topic: note.topic,
        sourceType: "note" as const,
      })),

    ...materials
      .filter((material) => material._id)
      .map((material) => ({
        id: material._id,
        title: material.title,
        topic: material.topic,
        sourceType: "learningMaterial" as const,
      })),
  ];

  // Find the source selected in the create form.
  const selectedSource = sources.find(
    (source) => source.id === selectedSourceId
  );

  // Build the topic list from the user's real sources and flashcards.
  const topicNames = Array.from(
    new Set([
      ...sources.map((source) => source.topic),
      ...flashcards.map((card) => card.topic),
    ])
  ).filter(Boolean);

  // Get the flashcards belonging to the selected topic.
  const topicFlashcards = flashcards.filter(
    (card) => card.topic === viewTopic
  );

  // Get the current flashcard.
  const currentCard = topicFlashcards[currentCardIndex];

  // Save a flashcard to the backend.
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedSource || !question.trim() || !answer.trim()) {
      setErrorMessage("Please select a source and complete both fields.");
      return;
    }

    const flashcardData: FlashcardBody = {
      topic: selectedSource.topic,
      question: question.trim(),
      answer: answer.trim(),
      sources: [
        {
          sourceId: selectedSource.id,
          sourceType: selectedSource.sourceType,
        },
      ],
    };

    try {
      setIsSaving(true);
      setErrorMessage("");

      // Save the card and add the returned record to the page.
      const savedCard = await createFlashcard(flashcardData);

      setFlashcards((previousCards) => [
        ...previousCards,
        savedCard,
      ]);

      // Clear the form after a successful save.
      setQuestion("");
      setAnswer("");
      setSelectedSourceId("");
      setShowForm(false);
    } catch {
      setErrorMessage("Unable to save the flashcard. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  // Open a topic and show its first flashcard.
  function handleViewTopic(topicName: string) {
    setViewTopic(topicName);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setErrorMessage("");
  }

  // Flip between the question and answer.
  function handleFlip() {
    setIsFlipped((previousValue) => !previousValue);
  }

  // Move to the next flashcard.
  function handleNextCard() {
    if (currentCardIndex < topicFlashcards.length - 1) {
      setCurrentCardIndex((previousIndex) => previousIndex + 1);
      setIsFlipped(false);
    }
  }

  // Move to the previous flashcard.
  function handlePreviousCard() {
    if (currentCardIndex > 0) {
      setCurrentCardIndex((previousIndex) => previousIndex - 1);
      setIsFlipped(false);
    }
  }

  // Close the study window.
  function handleCloseStudy() {
    setViewTopic(null);
    setCurrentCardIndex(0);
    setIsFlipped(false);
  }

  // Delete a saved flashcard.
  async function handleDeleteCard(card: Flashcard) {
    if (!card._id) {
      setErrorMessage("This flashcard has no valid ID.");
      return;
    }

    try {
      await deleteFlashcard(card._id);

      setFlashcards((previousCards) =>
        previousCards.filter((item) => item._id !== card._id)
      );

      // Keep the selected index within the remaining cards.
      setCurrentCardIndex((previousIndex) =>
        Math.min(
          previousIndex,
          Math.max(topicFlashcards.length - 2, 0)
        )
      );

      setIsFlipped(false);
    } catch {
      setErrorMessage("Unable to delete the flashcard. Please try again.");
    }
  }

  return (
    <DashboardLayout
      backLabel="Back to Library"
      backTo="/allLearningMaterials"
    >
      <main className="min-h-screen bg-[#FDF3EC] px-4 py-6 text-[#2D4030] sm:px-6 lg:px-8">
        {/* Page heading */}
        <p className="mb-5 text-xl font-bold sm:text-3xl">
          Flip, discover, and remember what you learn.
        </p>

        {/* Display backend errors */}
        {errorMessage && (
          <div
            role="alert"
            className="mb-5 rounded-xl border border-red-200 bg-white p-3 text-sm text-red-700"
          >
            {errorMessage}
          </div>
        )}

        {/* Create panel and topic list */}
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          {/* Create flashcards panel */}
          <section className="rounded-2xl border border-[#E6D7CA] bg-white p-5 shadow-sm sm:p-6">
            {/* Decorative stack of cards */}
            <div className="mb-6 flex h-24 w-28 items-center justify-center">
              <div className="relative h-24 w-24">
                <div className="absolute left-8 top-1 h-[76px] w-[54px] rotate-[12deg] rounded-xl border border-[#2D4030]/10 bg-[#A3B19B] shadow-sm" />

                <div className="absolute left-3 top-2 h-[76px] w-[54px] -rotate-[12deg] rounded-xl border border-[#2D4030]/10 bg-[#F27A58] shadow-sm" />

                <div className="absolute left-5 top-3 flex h-[76px] w-[54px] flex-col items-center justify-center rounded-xl border border-[#2D4030]/10 bg-[#E8EDE2] shadow-md">
                  <BookOpen
                    size={22}
                    strokeWidth={1.8}
                    className="text-[#2D4030]"
                  />

                  <div className="mt-3 space-y-1.5">
                    <div className="h-1 w-6 rounded-full bg-[#2D4030]/50" />
                    <div className="h-1 w-8 rounded-full bg-[#2D4030]/30" />
                    <div className="h-1 w-5 rounded-full bg-[#2D4030]/30" />
                  </div>
                </div>
              </div>
            </div>

            <h2 className="text-xl font-bold">Create Flashcards</h2>

            <div className="my-6 rounded-xl bg-[#FDF3EC] p-4">
              <div className="flex items-start gap-3">
                <BookOpen
                  size={21}
                  className="mt-0.5 shrink-0 text-[#F27A58]"
                />

                <div>
                  <p className="text-sm font-semibold">Flip to remember</p>
                  <p className="mt-1 text-xs leading-5 text-[#74675F]">
                    Read a question, think of the answer, and flip the card
                    to check yourself.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setErrorMessage("");
                setShowForm(true);
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2D4030] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#405743]"
            >
              <Plus size={18} />
              Create Flashcard
            </button>
          </section>

          {/* Topics generated from the user's data */}
          <section className="min-w-0">
            <p className="mb-5 text-xl font-semibold sm:text-2xl">
              Choose a topic to start revising.
            </p>

            {isLoading ? (
              <p className="rounded-xl bg-white p-5 text-sm text-[#74675F]">
                Loading your flashcards...
              </p>
            ) : topicNames.length === 0 ? (
              <div className="rounded-2xl border border-[#E6D7CA] bg-white p-6">
                <h3 className="font-bold">No topics yet</h3>
                <p className="mt-2 text-sm leading-6 text-[#74675F]">
                  Add a note or learning material first. Its topic will appear
                  here so you can create linked flashcards.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 2xl:grid-cols-3">
                {topicNames.map((topicName, index) => {
                  // Count saved flashcards for this topic.
                  const cardCount = flashcards.filter(
                    (card) => card.topic === topicName
                  ).length;

                  // Find a source to show a description for the topic.
                  const topicSource = sources.find(
                    (source) => source.topic === topicName
                  );

                  return (
                    <article
                      key={topicName}
                      className="flex min-h-[220px] flex-col rounded-2xl border border-[#E6D7CA] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                    >
                      <div
                        className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl"
                        style={{
                          backgroundColor:
                            cardColors[(index + 2) % cardColors.length],
                        }}
                      >
                        <Layers size={23} />
                      </div>

                      <h3 className="text-lg font-bold">{topicName}</h3>

                      <p className="mt-2 text-sm leading-5 text-[#74675F]">
                        {topicSource
                          ? topicSource.title
                          : "Your saved flashcards"}
                      </p>

                      <div className="mt-auto flex items-center justify-between gap-2 pt-6">
                        <span className="rounded-full bg-[#E8EDE2] px-3 py-1.5 text-xs font-semibold text-[#2D4030]">
                          {cardCount} {cardCount === 1 ? "card" : "cards"}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleViewTopic(topicName)}
                          className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-[#2D4030] transition hover:bg-[#FDF3EC]"
                        >
                          View
                          <ArrowRight size={16} />
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* Create flashcard form */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#2D4030]/50 p-4">
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="create-title"
              className="my-auto w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl sm:p-7"
            >
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <h2 id="create-title" className="text-2xl font-bold">
                    Create Flashcard
                  </h2>

                  <p className="mt-2 text-sm text-[#74675F]">
                    Choose a source, then add a question and answer.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  aria-label="Close form"
                  className="rounded-lg p-2 transition hover:bg-[#FDF3EC]"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Choose a real note or learning material */}
                <div>
                  <label
                    htmlFor="source"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Source
                  </label>

                  <select
                    id="source"
                    value={selectedSourceId}
                    onChange={(event) =>
                      setSelectedSourceId(event.target.value)
                    }
                    required
                    className="w-full rounded-xl border border-[#D7C8BB] bg-white px-4 py-3 text-sm outline-none focus:border-[#2D4030]"
                  >
                    <option value="">Select a note or material</option>

                    {sources.map((source) => (
                      <option
                        key={`${source.sourceType}-${source.id}`}
                        value={source.id}
                      >
                        {source.title} — {source.topic} (
                        {source.sourceType === "note"
                          ? "Note"
                          : "Learning Material"}
                        )
                      </option>
                    ))}
                  </select>

                  {sources.length === 0 && (
                    <p className="mt-2 text-xs leading-5 text-[#74675F]">
                      No sources are available. Create a note or learning
                      material first.
                    </p>
                  )}
                </div>

                {/* Show the selected source's topic */}
                {selectedSource && (
                  <div className="rounded-xl bg-[#E8EDE2] p-3">
                    <p className="text-xs text-[#74675F]">Topic</p>
                    <p className="mt-1 text-sm font-semibold">
                      {selectedSource.topic}
                    </p>
                  </div>
                )}

                {/* Enter the question */}
                <div>
                  <label
                    htmlFor="question"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Question
                  </label>

                  <textarea
                    id="question"
                    value={question}
                    onChange={(event) => setQuestion(event.target.value)}
                    placeholder="Enter your question..."
                    required
                    rows={3}
                    className="w-full rounded-xl border border-[#D7C8BB] px-4 py-3 text-sm outline-none focus:border-[#2D4030]"
                  />
                </div>

                {/* Enter the answer */}
                <div>
                  <label
                    htmlFor="answer"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Answer
                  </label>

                  <textarea
                    id="answer"
                    value={answer}
                    onChange={(event) => setAnswer(event.target.value)}
                    placeholder="Enter the answer..."
                    required
                    rows={4}
                    className="w-full rounded-xl border border-[#D7C8BB] px-4 py-3 text-sm outline-none focus:border-[#2D4030]"
                  />
                </div>

                {/* Form buttons */}
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="rounded-xl border border-[#D7C8BB] px-5 py-3 text-sm font-semibold transition hover:bg-[#FDF3EC]"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSaving || sources.length === 0}
                    className="rounded-xl bg-[#F27A58] px-5 py-3 text-sm font-semibold text-[#2D4030] transition hover:bg-[#E96847] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSaving ? "Saving..." : "Save Flashcard"}
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}

        {/* Flashcard study window */}
        {viewTopic && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#2D4030]/60 p-4">
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="study-title"
              className="my-auto w-full max-w-xl rounded-3xl bg-[#FDF3EC] p-5 shadow-2xl sm:p-7"
            >
              {/* Study window heading */}
              <div className="mb-6 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#F27A58]">
                    BrainMemora · Revision
                  </p>

                  <h2 id="study-title" className="mt-1 text-2xl font-bold">
                    {viewTopic}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={handleCloseStudy}
                  aria-label="Close flashcards"
                  className="rounded-xl p-2 transition hover:bg-[#E8EDE2]"
                >
                  <X size={22} />
                </button>
              </div>

              {/* Show an empty state when this topic has no cards */}
              {topicFlashcards.length === 0 ? (
                <div className="rounded-2xl border border-[#D7C8BB] bg-white px-5 py-12 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8EDE2]">
                    <Layers size={27} />
                  </div>

                  <h3 className="text-lg font-bold">No flashcards yet</h3>

                  <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#74675F]">
                    Create a question and answer linked to a source in this
                    topic.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      const topicSource = sources.find(
                        (source) => source.topic === viewTopic
                      );

                      setSelectedSourceId(topicSource?.id ?? "");
                      setViewTopic(null);
                      setShowForm(true);
                    }}
                    disabled={!sources.some(
                      (source) => source.topic === viewTopic
                    )}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#2D4030] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#405743] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Plus size={17} />
                    Create a card
                  </button>
                </div>
              ) : (
                <>
                  {/* Current card number */}
                  <div className="mb-4 flex items-center justify-between text-sm">
                    <span className="font-semibold">
                      Card {currentCardIndex + 1} of {topicFlashcards.length}
                    </span>

                    <span className="text-[#74675F]">
                      {isFlipped ? "Answer" : "Question"}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="mb-6 h-2 overflow-hidden rounded-full bg-[#E6D7CA]">
                    <div
                      className="h-full rounded-full bg-[#F27A58] transition-all duration-300"
                      style={{
                        width: `${
                          ((currentCardIndex + 1) / topicFlashcards.length) *
                          100
                        }%`,
                      }}
                    />
                  </div>

                  {/* Flip card */}
                  <div className="mx-auto w-full [perspective:1000px]">
                    <button
                      type="button"
                      onClick={handleFlip}
                      aria-label={
                        isFlipped ? "Flip to question" : "Flip to answer"
                      }
                      className="group relative mx-auto block h-[380px] w-full max-w-[260px] rounded-[22px] text-left outline-none focus-visible:ring-4 focus-visible:ring-[#F27A58]/50 sm:h-[420px] sm:max-w-[290px]"
                    >
                      <div
                        className="relative h-full w-full rounded-[22px] transition-transform duration-500 [transform-style:preserve-3d]"
                        style={{
                          transform: isFlipped
                            ? "rotateY(180deg)"
                            : "rotateY(0deg)",
                        }}
                      >
                        {/* Question side */}
                        <div
                          className="absolute inset-0 flex flex-col items-center justify-center rounded-[22px] p-6 text-center shadow-lg [backface-visibility:hidden] sm:p-8"
                          style={{
                            backgroundColor:
                              cardColors[
                                (currentCardIndex * 2) % cardColors.length
                              ],
                            color:
                              cardColors[
                                (currentCardIndex * 2) % cardColors.length
                              ] === "#2D4030"
                                ? "#FDF3EC"
                                : "#2D4030",
                          }}
                        >
                          <span className="mb-6 rounded-full bg-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-widest">
                            <BookOpen size={14} className="mr-2 inline" />
                            Question
                          </span>

                          <span className="text-xl font-bold leading-relaxed sm:text-2xl">
                            {currentCard?.question}
                          </span>

                          <span className="mt-8 flex items-center gap-2 text-sm font-medium opacity-80">
                            <RotateCw size={16} />
                            Click to reveal answer
                          </span>
                        </div>

                        {/* Answer side */}
                        <div
                          className="absolute inset-0 flex flex-col items-center justify-center rounded-[22px] p-6 text-center shadow-lg [backface-visibility:hidden] [transform:rotateY(180deg)] sm:p-8"
                          style={{
                            backgroundColor:
                              cardColors[
                                (currentCardIndex * 2 + 1) %
                                  cardColors.length
                              ],
                            color:
                              cardColors[
                                (currentCardIndex * 2 + 1) %
                                  cardColors.length
                              ] === "#2D4030"
                                ? "#FDF3EC"
                                : "#2D4030",
                          }}
                        >
                          <span className="mb-6 rounded-full bg-white/25 px-4 py-2 text-xs font-semibold uppercase tracking-widest">
                            <Sparkles size={14} className="mr-2 inline" />
                            Answer
                          </span>

                          <span className="text-lg font-medium leading-relaxed sm:text-xl">
                            {currentCard?.answer}
                          </span>

                          <span className="mt-8 flex items-center gap-2 text-sm font-medium opacity-80">
                            <RotateCw size={16} />
                            Click to see question
                          </span>
                        </div>
                      </div>
                    </button>
                  </div>

                  {/* Delete current flashcard */}
                  <div className="mt-4 text-center">
                    <button
                      type="button"
                      onClick={() => handleDeleteCard(currentCard)}
                      className="rounded-lg px-3 py-2 text-sm font-semibold text-[#9A4432] transition hover:bg-white"
                    >
                      Delete this card
                    </button>
                  </div>

                  {/* Previous and next buttons */}
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={handlePreviousCard}
                      disabled={currentCardIndex === 0}
                      className="inline-flex items-center gap-2 rounded-xl border border-[#D7C8BB] bg-white px-4 py-3 text-sm font-semibold transition hover:bg-[#E8EDE2] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronLeft size={18} />
                      Previous
                    </button>

                    <button
                      type="button"
                      onClick={handleNextCard}
                      disabled={
                        currentCardIndex === topicFlashcards.length - 1
                      }
                      className="inline-flex items-center gap-2 rounded-xl bg-[#2D4030] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#405743] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next
                      <ChevronRight size={18} />
                    </button>
                  </div>

                  <p className="mt-5 text-center text-xs leading-5 text-[#74675F]">
                    Think of the answer first, then flip the card to check
                    what you remember.
                  </p>
                </>
              )}
            </section>
          </div>
        )}
      </main>
    </DashboardLayout>
  );
}
