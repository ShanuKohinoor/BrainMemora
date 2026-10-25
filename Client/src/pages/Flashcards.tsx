
import { useEffect, useState } from "react";
import {
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
  deleteFlashcard,
  generateFlashcardFromNote,
  generateFlashcardsFromMaterials,
} from "../services/flashCardService";

import type { Flashcard } from "../types/flashcard.types";
import type {
  LearningMaterial,
  MaterialType,
} from "../types/learningMaterial.types";

// Pastel colors used for the revision cards.
const cardColors = ["#A7C1D0", "#D9A399", "#F2D69B", "#B5CDA8"];

// Labels for the supported Learning Material types.
const materialTypes: { value: MaterialType; label: string }[] = [
  { value: "pdf", label: "PDF" },
  { value: "video", label: "Video" },
  { value: "url", label: "URL" },
  { value: "audio", label: "Audio" },
  { value: "article", label: "Article" },
  { value: "image", label: "Image" },
];

export default function Flashcards() {
  const dispatch = useAppDispatch();

  // Get saved notes and Learning Materials from Redux.
  const notes = useAppSelector((state) => state.notes.notes);
  const materials = useAppSelector(
    (state) => state.learningMaterials.materials
  );

  // Store saved and newly generated flashcards.
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);

  // Store the topic and title selected by the user.
  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedNoteId, setSelectedNoteId] = useState("");
  const [selectedMaterialTitle, setSelectedMaterialTitle] = useState("");

  // Store the selected material IDs and types.
  const [selectedMaterialIds, setSelectedMaterialIds] = useState<string[]>([]);
  const [selectedMaterialTypes, setSelectedMaterialTypes] = useState<
    MaterialType[]
  >([]);

  // Store flashcard generation settings.
  const [numberOfCards, setNumberOfCards] = useState(10);
  const [difficultyLevel, setDifficultyLevel] = useState<
    "easy" | "medium" | "hard"
  >("medium");

  // Control the revision window and flip-card interaction.
  const [viewTopic, setViewTopic] = useState<string | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Track loading, generation, and feedback messages.
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Load notes, Learning Materials, and saved flashcards when the page opens.
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

  // Get unique topics from notes that have valid IDs.
  const noteTopics = Array.from(
    new Set(
      notes
        .filter((note) => note._id && note.topic?.trim())
        .map((note) => note.topic.trim())
    )
  ).sort();

  // Get unique topics from Learning Materials.
  const materialTopics = Array.from(
    new Set(
      materials
        .filter((material) => material._id && material.topic?.trim())
        .map((material) => material.topic.trim())
    )
  ).sort();

  // Combine note topics and material topics.
  const allTopics = Array.from(
    new Set([...noteTopics, ...materialTopics])
  ).sort();

  // // Show notes belonging to the selected topic.
  // const filteredNotes = notes.filter(
  //   (note) => note._id && note.topic === selectedTopic
  // );

  // Show materials belonging to the selected topic.
  const materialsForTopic = materials.filter(
    (material) =>
      material._id && material.topic?.trim() === selectedTopic
  );

  // Get unique material titles for the selected topic.
  const materialTitles = Array.from(
    new Set(
      materialsForTopic
        .map((material) => material.title.trim())
        .filter(Boolean)
    )
  ).sort();

  // Show materials belonging to the selected title.
  const filteredMaterials = materialsForTopic.filter(
    (material) => material.title.trim() === selectedMaterialTitle
  );

  // Get material types available for the selected title.
  const availableMaterialTypes = materialTypes.filter((type) =>
    filteredMaterials.some((material) => material.type === type.value)
  );

  // Filter materials by the selected types.
  const visibleMaterials =
    selectedMaterialTypes.length === 0
      ? filteredMaterials
      : filteredMaterials.filter((material) =>
          selectedMaterialTypes.includes(material.type)
        );

  // Get unique topics that have saved flashcards.
  const topicNames = Array.from(
    new Set(flashcards.map((card) => card.topic).filter(Boolean))
  );

  // Get flashcards for the currently opened revision topic.
  const topicFlashcards = flashcards.filter(
    (card) => card.topic === viewTopic
  );

  // Get the current flashcard.
  const currentCard = topicFlashcards[currentCardIndex];

  // Clear old messages when a material type is changed.
  function handleToggleMaterialType(type: MaterialType) {
    setSelectedMaterialTypes((previousTypes) =>
      previousTypes.includes(type)
        ? previousTypes.filter((item) => item !== type)
        : [...previousTypes, type]
    );

    setErrorMessage("");
    setSuccessMessage("");
  }

  // Select or deselect an individual Learning Material.
  function handleToggleMaterial(materialId: string) {
    setSelectedMaterialIds((previousIds) =>
      previousIds.includes(materialId)
        ? previousIds.filter((id) => id !== materialId)
        : [...previousIds, materialId]
    );

    setErrorMessage("");
    setSuccessMessage("");
  }

  // Select or deselect all currently visible materials.
  function handleToggleAllMaterials() {
    const visibleIds = visibleMaterials
      .map((material) => material._id)
      .filter((id): id is string => Boolean(id));

    const allSelected =
      visibleIds.length > 0 &&
      visibleIds.every((id) => selectedMaterialIds.includes(id));

    setSelectedMaterialIds((previousIds) =>
      allSelected
        ? previousIds.filter((id) => !visibleIds.includes(id))
        : Array.from(new Set([...previousIds, ...visibleIds]))
    );

    setErrorMessage("");
    setSuccessMessage("");
  }

  // Generate flashcards from either a note or selected materials.
  async function handleGenerateFlashcards() {
    setErrorMessage("");
    setSuccessMessage("");

    // A topic is required for either generation method.
    if (!selectedTopic) {
      setErrorMessage("Please select a topic.");
      return;
    }

    // Keep the existing note-based generation working.
    if (selectedNoteId) {
      try {
        setIsGenerating(true);

        const generatedCards = await generateFlashcardFromNote(
          selectedNoteId,
          numberOfCards,
          difficultyLevel
        );

        // Stop if the backend returned no cards.
        if (!generatedCards || generatedCards.length === 0) {
          setSuccessMessage(
            "No flashcards were generated from this note. Try a note with more explanatory content."
          );
          return;
        }

        // Add the new cards to the current card list.
        setFlashcards((previousCards) => [
          ...generatedCards,
          ...previousCards,
        ]);

        // Open the topic so the user can begin revising.
        setViewTopic(generatedCards[0].topic);
        setCurrentCardIndex(0);
        setIsFlipped(false);

        setSuccessMessage(
          `${generatedCards.length} flashcard(s) generated successfully.`
        );
      } catch {
        setErrorMessage("Unable to generate flashcards. Please try again.");
      } finally {
        setIsGenerating(false);
      }

      return;
    }

    // Validate the Learning Material selection.
    if (!selectedMaterialTitle || selectedMaterialIds.length === 0) {
      setErrorMessage(
        "Please select a title and at least one Learning Material."
      );
      return;
    }

    // Generate flashcards from the selected PDFs or images.
    try {
      setIsGenerating(true);

      const generatedCards = await generateFlashcardsFromMaterials(
        selectedMaterialIds,
        numberOfCards,
        difficultyLevel
      );

      // Handle a response that contains no generated cards.
      if (!generatedCards || generatedCards.length === 0) {
        setSuccessMessage(
          "No flashcards were generated. Try selecting materials with more readable text."
        );
        return;
      }

      // Add the generated cards without removing existing cards.
      setFlashcards((previousCards) => [
        ...generatedCards,
        ...previousCards,
      ]);

      // Open the topic containing the newly generated cards.
      setViewTopic(generatedCards[0].topic);
      setCurrentCardIndex(0);
      setIsFlipped(false);

      setSuccessMessage(
        `${generatedCards.length} flashcard(s) generated successfully.`
      );
    } catch {
      setErrorMessage(
        "Unable to generate flashcards from these materials. Please try again."
      );
    } finally {
      setIsGenerating(false);
    }
  }

  // Open a topic and display its first card.
  function handleViewTopic(topicName: string) {
    setViewTopic(topicName);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setErrorMessage("");
    setSuccessMessage("");
  }

  // Flip between the question and answer.
  function handleFlip() {
    setIsFlipped((previousValue) => !previousValue);
  }

  // Move to the next card.
  function handleNextCard() {
    if (currentCardIndex < topicFlashcards.length - 1) {
      setCurrentCardIndex((previousIndex) => previousIndex + 1);
      setIsFlipped(false);
    }
  }

  // Move to the previous card.
  function handlePreviousCard() {
    if (currentCardIndex > 0) {
      setCurrentCardIndex((previousIndex) => previousIndex - 1);
      setIsFlipped(false);
    }
  }

  // Close the revision window.
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
      setErrorMessage("");

      await deleteFlashcard(card._id);

      // Remove the deleted card from the list.
      const remainingCards = flashcards.filter(
        (item) => item._id !== card._id
      );

      setFlashcards(remainingCards);

      // Find cards remaining in the current topic.
      const remainingTopicCards = remainingCards.filter(
        (item) => item.topic === viewTopic
      );

      // Close the revision window if no cards remain.
      if (remainingTopicCards.length === 0) {
        handleCloseStudy();
        return;
      }

      // Keep the selected index within the remaining cards.
      setCurrentCardIndex((previousIndex) =>
        Math.min(previousIndex, remainingTopicCards.length - 1)
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

        {/* Error message */}
        {errorMessage && (
          <div
            role="alert"
            className="mb-5 rounded-xl border border-red-200 bg-white p-3 text-sm text-red-700"
          >
            {errorMessage}
          </div>
        )}

        {/* Success message */}
        {successMessage && (
          <div
            role="status"
            className="mb-5 rounded-xl border border-[#A3B19B] bg-white p-3 text-sm text-[#2D4030]"
          >
            {successMessage}
          </div>
        )}

        {/* Generation area and saved topics */}
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          {/* Generate flashcards panel */}
          <section className="rounded-2xl border border-[#E6D7CA] bg-white p-5 shadow-sm sm:p-6">
            {/* Decorative cards */}
            <div className="mb-6 flex h-24 w-28 items-center justify-center">
              <div className="relative h-24 w-24">
                <div className="absolute left-8 top-1 h-[76px] w-[54px] rotate-[12deg] rounded-xl border border-[#2D4030]/10 bg-[#B5CDA8] shadow-sm" />

                <div className="absolute left-3 top-2 h-[76px] w-[54px] -rotate-[12deg] rounded-xl border border-[#2D4030]/10 bg-[#D9A399] shadow-sm" />

                <div className="absolute left-5 top-3 flex h-[76px] w-[54px] flex-col items-center justify-center rounded-xl border border-[#2D4030]/10 bg-[#A7C1D0] shadow-md">
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

            <h2 className="text-xl font-bold">Generate Flashcards</h2>

            <div className="my-6 rounded-xl bg-[#FDF3EC] p-4">
              <div className="flex items-start gap-3">
                <BookOpen
                  size={21}
                  className="mt-0.5 shrink-0 text-[#F27A58]"
                />

                <div>
                  <p className="text-sm font-semibold">
                    Learn from your materials
                  </p>

                  <p className="mt-1 text-xs leading-5 text-[#74675F]">
                    Choose a topic and title, then select individual files
                    or all materials to prepare your flashcards.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              {/* Choose a topic */}
              <div>
                <label
                  htmlFor="note-topic"
                  className="mb-2 block text-sm font-semibold"
                >
                  1. Choose Topic
                </label>

                <select
                  id="note-topic"
                  value={selectedTopic}
                  onChange={(event) => {
                    setSelectedTopic(event.target.value);
                    setSelectedNoteId("");
                    setSelectedMaterialTitle("");
                    setSelectedMaterialIds([]);
                    setSelectedMaterialTypes([]);
                    setErrorMessage("");
                    setSuccessMessage("");
                  }}
                  className="w-full rounded-xl border border-[#D7C8BB] bg-white px-3 py-3 text-sm outline-none focus:border-[#2D4030]"
                >
                  <option value="">Select a topic</option>

                  {allTopics.map((topic) => (
                    <option key={topic} value={topic}>
                      {topic}
                    </option>
                  ))}
                </select>

                {allTopics.length === 0 && (
                  <p className="mt-2 text-xs leading-5 text-[#74675F]">
                    Add a note or Learning Material first.
                  </p>
                )}
              </div>

              {/* Choose a material title */}
              <div>
                <label
                  htmlFor="material-title"
                  className="mb-2 block text-sm font-semibold"
                >
                  2. Choose Title
                </label>

                <select
                  id="material-title"
                  value={selectedMaterialTitle}
                  onChange={(event) => {
                    setSelectedMaterialTitle(event.target.value);
                    setSelectedNoteId("");
                    setSelectedMaterialIds([]);
                    setSelectedMaterialTypes([]);
                    setErrorMessage("");
                    setSuccessMessage("");
                  }}
                  disabled={!selectedTopic}
                  className="w-full rounded-xl border border-[#D7C8BB] bg-white px-3 py-3 text-sm outline-none focus:border-[#2D4030] disabled:cursor-not-allowed disabled:bg-gray-100"
                >
                  <option value="">
                    {selectedTopic
                      ? "Select a title"
                      : "Choose a topic first"}
                  </option>

                  {materialTitles.map((title) => (
                    <option key={title} value={title}>
                      {title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter materials by type */}
              {selectedMaterialTitle && (
                <>
                  <div>
                    <p className="mb-2 text-sm font-semibold">
                      3. Filter by Material Type
                    </p>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedMaterialTypes([]);
                          setSelectedMaterialIds([]);
                        }}
                        className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${
                          selectedMaterialTypes.length === 0
                            ? "border-[#2D4030] bg-[#2D4030] text-white"
                            : "border-[#D7C8BB] bg-white text-[#2D4030] hover:bg-[#FDF3EC]"
                        }`}
                      >
                        All Types
                      </button>

                      {availableMaterialTypes.map((type) => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => handleToggleMaterialType(type.value)}
                          className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${
                            selectedMaterialTypes.includes(type.value)
                              ? "border-[#2D4030] bg-[#2D4030] text-white"
                              : "border-[#D7C8BB] bg-white text-[#2D4030] hover:bg-[#FDF3EC]"
                          }`}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Select individual materials or all visible materials */}
                  <div>
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <label className="block text-sm font-semibold">
                        4. Select Materials
                      </label>

                      {visibleMaterials.length > 0 && (
                        <button
                          type="button"
                          onClick={handleToggleAllMaterials}
                          className="text-xs font-semibold text-[#F27A58] hover:underline"
                        >
                          {visibleMaterials.every((material) =>
                            selectedMaterialIds.includes(material._id)
                          )
                            ? "Deselect All"
                            : "Select All"}
                        </button>
                      )}
                    </div>

                    {visibleMaterials.length === 0 ? (
                      <p className="rounded-xl border border-[#D7C8BB] bg-[#FDF3EC] p-3 text-xs leading-5 text-[#74675F]">
                        No materials match this selection.
                      </p>
                    ) : (
                      <div className="max-h-56 space-y-2 overflow-y-auto rounded-xl border border-[#D7C8BB] p-3">
                        {visibleMaterials.map(
                          (material: LearningMaterial) => (
                            <label
                              key={material._id}
                              className="flex cursor-pointer items-start gap-3 rounded-lg p-2 text-sm transition hover:bg-[#FDF3EC]"
                            >
                              <input
                                type="checkbox"
                                checked={selectedMaterialIds.includes(
                                  material._id
                                )}
                                onChange={() =>
                                  handleToggleMaterial(material._id)
                                }
                                className="mt-0.5 accent-[#2D4030]"
                              />

                              <span className="min-w-0 flex-1 break-words">
                                <span className="block font-medium">
                                  {material.title}
                                </span>

                                <span className="mt-1 block text-xs text-[#74675F]">
                                  {materialTypes.find(
                                    (type) => type.value === material.type
                                  )?.label ?? material.type}
                                </span>

                                {material.description?.trim() && (
                                  <span className="mt-1 block text-xs leading-5 text-[#74675F]">
                                    {material.description}
                                  </span>
                                )}
                              </span>
                            </label>
                          )
                        )}
                      </div>
                    )}

                    <p className="mt-2 text-xs leading-5 text-[#74675F]">
                      {selectedMaterialIds.length} material(s) selected.
                    </p>
                  </div>
                </>
              )}

              {/* Choose the number of flashcards */}
              <div>
                <label
                  htmlFor="card-count"
                  className="mb-2 block text-sm font-semibold"
                >
                  5. Number of Cards
                </label>

                <select
                  id="card-count"
                  value={numberOfCards}
                  onChange={(event) =>
                    setNumberOfCards(Number(event.target.value))
                  }
                  className="w-full rounded-xl border border-[#D7C8BB] bg-white px-3 py-3 text-sm outline-none focus:border-[#2D4030]"
                >
                  <option value={5}>5 cards</option>
                  <option value={10}>10 cards</option>
                  <option value={15}>15 cards</option>
                  <option value={20}>20 cards</option>
                </select>
              </div>

              {/* Choose the difficulty */}
              <div>
                <label
                  htmlFor="difficulty"
                  className="mb-2 block text-sm font-semibold"
                >
                  6. Difficulty
                </label>

                <select
                  id="difficulty"
                  value={difficultyLevel}
                  onChange={(event) =>
                    setDifficultyLevel(
                      event.target.value as "easy" | "medium" | "hard"
                    )
                  }
                  className="w-full rounded-xl border border-[#D7C8BB] bg-white px-3 py-3 text-sm outline-none focus:border-[#2D4030]"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              {/* Generate flashcards from the selected materials */}
              <button
                type="button"
                onClick={handleGenerateFlashcards}
                disabled={
                  isGenerating ||
                  !selectedTopic ||
                  !selectedMaterialTitle ||
                  selectedMaterialIds.length === 0
                }
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2D4030] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#405743] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Sparkles size={18} />
                {isGenerating ? "Generating..." : "Generate Flashcards"}
              </button>

              {selectedNoteId && (
                <p className="text-xs leading-5 text-[#74675F]">
                  Note-based generation is available through the existing
                  note-generation service.
                </p>
              )}
            </div>
          </section>

          {/* Display topics that contain saved flashcards */}
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
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#D9A399]">
                  <Layers size={23} />
                </div>

                <h3 className="font-bold">No flashcards created yet</h3>

                <p className="mt-2 text-sm leading-6 text-[#74675F]">
                  Choose a saved note and generate your first flashcards.
                  Your saved topics will appear here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 2xl:grid-cols-3">
                {topicNames.map((topicName, index) => {
                  // Count the saved flashcards for this topic.
                  const cardCount = flashcards.filter(
                    (card) => card.topic === topicName
                  ).length;

                  // Find a note title belonging to this topic.
                  const topicNote = notes.find(
                    (note) => note.topic === topicName
                  );

                  const topicColor = cardColors[index % cardColors.length];

                  return (
                    <article
                      key={topicName}
                      className="flex min-h-[220px] flex-col rounded-2xl border border-[#E6D7CA] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                    >
                      <div
                        className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl"
                        style={{ backgroundColor: topicColor }}
                      >
                        <Layers size={23} />
                      </div>

                      <h3 className="text-lg font-bold">{topicName}</h3>

                      <p className="mt-2 text-sm leading-5 text-[#74675F]">
                        {topicNote?.title ?? "Your saved flashcards"}
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

        {/* Flashcard revision window */}
        {viewTopic && topicFlashcards.length > 0 && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#2D4030]/60 p-2 sm:p-4">
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="study-title"
              className="flex max-h-[calc(100dvh-1rem)] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-[#FDF3EC] p-3 shadow-2xl sm:max-h-[calc(100dvh-2rem)] sm:p-5"
            >
              {/* Revision window heading */}
              <div className="flex shrink-0 items-center justify-between gap-3">
                <div className="min-w-0">
                  <h2
                    id="study-title"
                    className="truncate text-xl font-bold sm:text-2xl"
                  >
                    {viewTopic}
                  </h2>

                  <p className="mt-1 text-sm text-[#74675F]">
                    Think first, then flip to check your answer.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCloseStudy}
                  aria-label="Close flashcards"
                  className="shrink-0 rounded-xl p-2 transition hover:bg-[#E8EDE2]"
                >
                  <X size={21} />
                </button>
              </div>

              {/* Card number and progress */}
              <div className="mt-3 flex shrink-0 items-center justify-between text-xs sm:text-sm">
                <span className="font-semibold">
                  Card {currentCardIndex + 1} of {topicFlashcards.length}
                </span>

                <span className="text-[#74675F]">
                  {isFlipped ? "Answer" : "Question"}
                </span>
              </div>

              <div className="mt-2 h-1.5 shrink-0 overflow-hidden rounded-full bg-[#E6D7CA]">
                <div
                  className="h-full rounded-full bg-[#F27A58] transition-all duration-300"
                  style={{
                    width: `${
                      ((currentCardIndex + 1) / topicFlashcards.length) * 100
                    }%`,
                  }}
                />
              </div>

              {/* Previous arrow, flip card, and next arrow */}
              {currentCard && (
                <div className="flex min-h-0 flex-1 items-center justify-center gap-1 py-3 sm:gap-4">
                  {/* Previous card */}
                  <button
                    type="button"
                    onClick={handlePreviousCard}
                    disabled={currentCardIndex === 0}
                    aria-label="Previous flashcard"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#2D4030] shadow-sm transition hover:bg-[#E8EDE2] disabled:cursor-not-allowed disabled:opacity-30 sm:h-12 sm:w-12"
                  >
                    <ChevronLeft size={24} />
                  </button>

                  {/* Flip card to reveal the question or answer */}
                  <button
                    type="button"
                    onClick={handleFlip}
                    aria-label={isFlipped ? "Show question" : "Show answer"}
                    className="relative h-[min(52dvh,420px)] min-h-[220px] w-full max-w-[290px] shrink rounded-[22px] text-left outline-none focus-visible:ring-4 focus-visible:ring-[#F27A58]/50 [perspective:1000px]"
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
                        className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden rounded-[22px] p-4 text-center shadow-lg [backface-visibility:hidden] sm:p-6"
                        style={{
                          backgroundColor:
                            cardColors[currentCardIndex % cardColors.length],
                          color: "#2D4030",
                        }}
                      >
                        <span className="mb-4 rounded-full bg-white/30 px-3 py-2 text-xs font-semibold uppercase tracking-widest">
                          <BookOpen size={14} className="mr-1 inline" />
                          Question
                        </span>

                        <span className="max-h-[65%] overflow-y-auto whitespace-pre-wrap break-words text-lg font-bold leading-relaxed sm:text-xl">
                          {currentCard.question}
                        </span>

                        <span className="mt-4 flex shrink-0 items-center gap-2 text-xs font-medium opacity-80 sm:text-sm">
                          <RotateCw size={15} />
                          Tap to reveal answer
                        </span>
                      </div>

                      {/* Answer side */}
                      <div
                        className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden rounded-[22px] p-4 text-center shadow-lg [backface-visibility:hidden] [transform:rotateY(180deg)] sm:p-6"
                        style={{
                          backgroundColor:
                            cardColors[
                              (currentCardIndex + 1) % cardColors.length
                            ],
                          color: "#2D4030",
                        }}
                      >
                        <span className="mb-4 rounded-full bg-white/30 px-3 py-2 text-xs font-semibold uppercase tracking-widest">
                          <Sparkles size={14} className="mr-1 inline" />
                          Answer
                        </span>

                        <span className="max-h-[65%] overflow-y-auto whitespace-pre-wrap break-words text-base font-medium leading-relaxed sm:text-lg">
                          {currentCard.answer}
                        </span>

                        <span className="mt-4 flex shrink-0 items-center gap-2 text-xs font-medium opacity-80 sm:text-sm">
                          <RotateCw size={15} />
                          Tap to see question
                        </span>
                      </div>
                    </div>
                  </button>

                  {/* Next card */}
                  <button
                    type="button"
                    onClick={handleNextCard}
                    disabled={currentCardIndex === topicFlashcards.length - 1}
                    aria-label="Next flashcard"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2D4030] text-white shadow-sm transition hover:bg-[#405743] disabled:cursor-not-allowed disabled:opacity-30 sm:h-12 sm:w-12"
                  >
                    <ChevronRight size={24} />
                  </button>
                </div>
              )}

              {/* Delete the current flashcard */}
              {currentCard && (
                <div className="flex shrink-0 justify-center pb-1">
                  <button
                    type="button"
                    onClick={() => handleDeleteCard(currentCard)}
                    className="rounded-lg px-3 py-2 text-xs font-semibold text-[#9A4432] transition hover:bg-white sm:text-sm"
                  >
                    Delete this card
                  </button>
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </DashboardLayout>
  );
}
