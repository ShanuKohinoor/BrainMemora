
import { useState, type FormEvent } from "react";
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

// The information stored for each flashcard.
type Flashcard = {
  id: string;
  topic: string;
  question: string;
  answer: string;
};

// The topics shown on the Flashcards page.
const initialTopics = [
  {
    name: "MongoDB",
    description: "Database concepts and queries",
    color: "#E8EDE2",
  },
  {
    name: "React",
    description: "Components, hooks and state",
    color: "#FCE6DC",
  },
  {
    name: "MERN Interview",
    description: "Full-stack interview preparation",
    color: "#EDE9F5",
  },
];

// Different colors used for the study cards.
const cardColors = [
  "#2D4030",
  "#F27A58",
  "#A3B19B",
  "#FCE6DC",
  "#E8EDE2",
  "#EDE9F5",
];

export default function Flashcards() {
  // Controls whether the create form is open.
  const [showForm, setShowForm] = useState(false);

  // Stores the question, answer and selected topic.
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");

  // Stores flashcards created while this page is open.
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);

  // Stores the topic currently being studied.
  const [viewTopic, setViewTopic] = useState<string | null>(null);

  // Tracks which flashcard is currently displayed.
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  // Controls whether the question or answer is visible.
  const [isFlipped, setIsFlipped] = useState(false);

  // Gets the flashcards belonging to the selected topic.
  const topicFlashcards = flashcards.filter(
    (card) => card.topic === viewTopic
  );

  // Gets the current flashcard.
  const currentCard = topicFlashcards[currentCardIndex];

  // Saves a new flashcard.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Do not save an incomplete flashcard.
    if (!selectedTopic || !question.trim() || !answer.trim()) {
      return;
    }

    // Create the new question-and-answer object.
    const newCard: Flashcard = {
      id: crypto.randomUUID(),
      topic: selectedTopic,
      question: question.trim(),
      answer: answer.trim(),
    };

    // Add the new card to the existing cards.
    setFlashcards((previousCards) => [...previousCards, newCard]);

    // Clear the form after saving.
    setQuestion("");
    setAnswer("");
    setSelectedTopic("");
    setShowForm(false);
  }

  // Opens a topic and starts with its first flashcard.
  function handleViewTopic(topicName: string) {
    setViewTopic(topicName);
    setCurrentCardIndex(0);
    setIsFlipped(false);
  }

  // Flips the card between the question and answer.
  function handleFlip() {
    setIsFlipped((previousValue) => !previousValue);
  }

  // Moves to the next flashcard.
  function handleNextCard() {
    if (currentCardIndex < topicFlashcards.length - 1) {
      setCurrentCardIndex((previousIndex) => previousIndex + 1);
      setIsFlipped(false);
    }
  }

  // Moves to the previous flashcard.
  function handlePreviousCard() {
    if (currentCardIndex > 0) {
      setCurrentCardIndex((previousIndex) => previousIndex - 1);
      setIsFlipped(false);
    }
  }

  // Closes the study window.
  function handleCloseStudy() {
    setViewTopic(null);
    setCurrentCardIndex(0);
    setIsFlipped(false);
  }

  return (
    <DashboardLayout
      backLabel="Back to Library"
      backTo="/allLearningMaterials"
    >
      <main className="min-h-screen bg-[#FDF3EC] px-4 py-6 text-[#2D4030] sm:px-6 lg:px-8">

        {/* Page heading */}
          <p className="text-xl font-bold sm:text-3xl mb-5">
                Flip, discover, and remember what you learn.

          </p>


        {/* Create panel and topic list */}
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">

          {/* Create flashcards panel */}
          <section className="rounded-2xl border border-[#E6D7CA] bg-white p-5 shadow-sm sm:p-6">

            {/* Colorful bundle of tall flashcards */}
            <div className="mb-6 flex h-24 w-28 items-center justify-center">
              <div className="relative h-24 w-24">

                {/* Back card */}
                <div className="absolute left-8 top-1 h-[76px] w-[54px] rotate-[12deg] rounded-xl border border-[#2D4030]/10 bg-[#A3B19B] shadow-sm" />

                {/* Middle card */}
                <div className="absolute left-3 top-2 h-[76px] w-[54px] -rotate-[12deg] rounded-xl border border-[#2D4030]/10 bg-[#F27A58] shadow-sm" />

                {/* Front card */}
                <div className="absolute left-5 top-3 flex h-[76px] w-[54px] flex-col items-center justify-center rounded-xl border border-[#2D4030]/10 bg-[#E8EDE2] shadow-md">
                  <BookOpen
                    size={22}
                    strokeWidth={1.8}
                    className="text-[#2D4030]"
                  />

                  {/* Small lines to resemble text on a card */}
                  <div className="mt-3 space-y-1.5">
                    <div className="h-1 w-6 rounded-full bg-[#2D4030]/50" />
                    <div className="h-1 w-8 rounded-full bg-[#2D4030]/30" />
                    <div className="h-1 w-5 rounded-full bg-[#2D4030]/30" />
                  </div>
                </div>

              </div>
            </div>

            <h2 className="text-xl font-bold">
              Create Flashcards
            </h2>

            {/* Short explanation of how flashcards work */}
            <div className="my-6 rounded-xl bg-[#FDF3EC] p-4">
              <div className="flex items-start gap-3">
                <BookOpen
                  size={21}
                  className="mt-0.5 shrink-0 text-[#F27A58]"
                />

                <div>
                  <p className="text-sm font-semibold">
                    Flip to remember
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[#74675F]">
                    Read a question, think of the answer,
                    and flip the card to check yourself.
                  </p>
                </div>
              </div>
            </div>

            {/* Opens the create form */}
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2D4030] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#405743]"
            >
              <Plus size={18} />
              Create Flashcard
            </button>
          </section>

          {/* Topic cards */}
          <section className="min-w-0">

              <p className="text-xl font-semibold sm:text-2xl mb-5">
                Choose a topic to start revising.
              </p>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 2xl:grid-cols-3">
              {initialTopics.map((topic) => {
                // Counts flashcards for this topic.
                const cardCount = flashcards.filter(
                  (card) => card.topic === topic.name
                ).length;

                return (
                  <article
                    key={topic.name}
                    className="flex min-h-[220px] flex-col rounded-2xl border border-[#E6D7CA] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                  >
                    {/* Topic icon */}
                    <div
                      className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl"
                      style={{ backgroundColor: topic.color }}
                    >
                      <Layers size={23} />
                    </div>

                    <h3 className="text-lg font-bold">
                      {topic.name}
                    </h3>

                    <p className="mt-2 text-sm leading-5 text-[#74675F]">
                      {topic.description}
                    </p>

                    {/* Card count and View button */}
                    <div className="mt-auto flex items-center justify-between gap-2 pt-6">
                      <span className="rounded-full bg-[#E8EDE2] px-3 py-1.5 text-xs font-semibold text-[#2D4030]">
                        {cardCount} {cardCount === 1 ? "card" : "cards"}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleViewTopic(topic.name)}
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
                  <h2
                    id="create-title"
                    className="text-2xl font-bold"
                  >
                    Create Flashcard
                  </h2>

                  <p className="mt-2 text-sm text-[#74675F]">
                    Add a question and its answer.
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

                {/* Select a topic */}
                <div>
                  <label
                    htmlFor="topic"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Topic
                  </label>

                  <select
                    id="topic"
                    value={selectedTopic}
                    onChange={(event) =>
                      setSelectedTopic(event.target.value)
                    }
                    required
                    className="w-full rounded-xl border border-[#D7C8BB] bg-white px-4 py-3 text-sm outline-none focus:border-[#2D4030]"
                  >
                    <option value="">Select a topic</option>

                    {initialTopics.map((topic) => (
                      <option key={topic.name} value={topic.name}>
                        {topic.name}
                      </option>
                    ))}
                  </select>
                </div>

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
                    className="rounded-xl bg-[#F27A58] px-5 py-3 text-sm font-semibold text-[#2D4030] transition hover:bg-[#E96847]"
                  >
                    Save Flashcard
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

                  <h2
                    id="study-title"
                    className="mt-1 text-2xl font-bold"
                  >
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

              {/* Show a message when the topic has no cards */}
              {topicFlashcards.length === 0 ? (
                <div className="rounded-2xl border border-[#D7C8BB] bg-white px-5 py-12 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8EDE2]">
                    <Layers size={27} />
                  </div>

                  <h3 className="text-lg font-bold">
                    No flashcards yet
                  </h3>

                  <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#74675F]">
                    Create a question and answer for this topic.
                    Your cards will appear here.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTopic(viewTopic);
                      setShowForm(true);
                      setViewTopic(null);
                    }}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#2D4030] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#405743]"
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
                          ((currentCardIndex + 1) /
                            topicFlashcards.length) *
                          100
                        }%`,
                      }}
                    />
                  </div>

                  {/* Tall flashcard with a flip animation */}
                  <div className="mx-auto w-full [perspective:1000px]">
                    <button
                      type="button"
                      onClick={handleFlip}
                      aria-label={
                        isFlipped
                          ? "Flip to question"
                          : "Flip to answer"
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
                            <BookOpen
                              size={14}
                              className="mr-2 inline"
                            />
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
                            <Sparkles
                              size={14}
                              className="mr-2 inline"
                            />
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

                  {/* Previous and next buttons */}
                  <div className="mt-7 flex items-center justify-between gap-3">
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
                    Think of the answer first, then flip the card
                    to check what you remember.
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
