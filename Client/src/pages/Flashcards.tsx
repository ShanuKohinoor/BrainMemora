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
  ChevronDown,
  ChevronUp,
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
import type { MaterialType } from "../types/learningMaterial.types";

type FlashcardSet = {
  key: string;
  topic: string;
  cards: Flashcard[];
};

const cardColors = ["#A7C1D0", "#D9A399", "#F2D69B", "#B5CDA8"];

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

  const notes = useAppSelector((state) => state.notes.notes);
  const materials = useAppSelector(
    (state) => state.learningMaterials.materials
  );

  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [showGenerationForm, setShowGenerationForm] = useState(false);

  // Topics must be selected before generating flashcards.
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

  const [selectedNoteId, setSelectedNoteId] = useState("");

  // Empty arrays mean no titles or types have been selected.
  const [selectedMaterialTitles, setSelectedMaterialTitles] =
    useState<string[]>([]);
  const [selectedMaterialTypes, setSelectedMaterialTypes] =
    useState<MaterialType[]>([]);

  // Control the checklist dropdowns.
  const [showTopicOptions, setShowTopicOptions] = useState(false);
  const [showTitleOptions, setShowTitleOptions] = useState(false);
  const [showTypeOptions, setShowTypeOptions] = useState(false);

  const [numberOfCards, setNumberOfCards] = useState(10);

  const [viewSetKey, setViewSetKey] = useState<string | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Load notes, learning materials and saved flashcards.
  useEffect(() => {
    dispatch(fetchNotes());
    dispatch(fetchLearningMaterials());

    async function loadFlashcards() {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const savedCards = await getAllFlashcards();

        setFlashcards((savedCards ?? []) as Flashcard[]);
      } catch {
        setErrorMessage("Unable to load flashcards. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadFlashcards();
  }, [dispatch]);

  // Get unique topics from notes.
  const noteTopics = Array.from(
    new Set(
      notes
        .filter((note) => note._id && note.topic?.trim())
        .map((note) => note.topic.trim())
    )
  ).sort();

  // Get unique topics from learning materials.
  const materialTopics = Array.from(
    new Set(
      materials
        .filter((material) => material._id && material.topic?.trim())
        .map((material) => material.topic.trim())
    )
  ).sort();

  // Combine topics from notes and learning materials.
  const allTopics = Array.from(
    new Set([...noteTopics, ...materialTopics])
  ).sort();

  // Keep only topics that still exist.
  const validSelectedTopics = selectedTopics.filter((topic) =>
    allTopics.includes(topic)
  );

  // Filter materials by the selected topics.
  const materialsForTopic = materials.filter(
    (material) =>
      material._id &&
      validSelectedTopics.includes(material.topic?.trim() ?? "")
  );

  // Get the titles available for the selected topics.
  const materialTitles = Array.from(
    new Set(
      materialsForTopic
        .map((material) => material.title.trim())
        .filter(Boolean)
    )
  ).sort();

  // Keep only titles that are still available.
  const validSelectedTitles = selectedMaterialTitles.filter((title) =>
    materialTitles.includes(title)
  );

  // Use selected titles to determine which material types are available.
  // If no title is selected yet, show types available across the topic.
  const materialsForTypeOptions =
    validSelectedTitles.length > 0
      ? materialsForTopic.filter((material) =>
          validSelectedTitles.includes(material.title.trim())
        )
      : materialsForTopic;

  const availableMaterialTypes = materialTypes.filter((type) =>
    materialsForTypeOptions.some(
      (material) => material.type === type.value
    )
  );

  // Keep only selected types that remain available.
  const validSelectedMaterialTypes = selectedMaterialTypes.filter((type) =>
    availableMaterialTypes.some(
      (availableType) => availableType.value === type
    )
  );

  // Only use materials whose title AND type were explicitly selected.
  const visibleMaterials = materialsForTopic.filter(
    (material) =>
      validSelectedTitles.includes(material.title.trim()) &&
      validSelectedMaterialTypes.includes(material.type)
  );

  // Collect IDs of materials matching every selected filter.
  const matchingMaterialIds = visibleMaterials
    .map((material) => material._id)
    .filter((id): id is string => Boolean(id));

  // Group flashcards by topic so each topic appears once.
  const flashcardSets: FlashcardSet[] = [];

  for (const card of flashcards) {
    if (!card.topic?.trim()) continue;

    let set = flashcardSets.find(
      (item) => item.topic === card.topic
    );

    if (!set) {
      set = {
        key: card.topic,
        topic: card.topic,
        cards: [],
      };

      flashcardSets.push(set);
    }

    set.cards.push(card);
  }

  flashcardSets.sort((a, b) => a.topic.localeCompare(b.topic));

  // Find the currently open topic.
  const activeSet =
    flashcardSets.find((set) => set.key === viewSetKey) ?? null;

  // Show every flashcard belonging to the selected topic.
  const topicFlashcards = activeSet?.cards ?? [];
  const currentCard = topicFlashcards[currentCardIndex];

  // Close the generation form.
  function handleCancelGeneration() {
    if (isGenerating) return;

    setShowGenerationForm(false);
    setErrorMessage("");
    setShowTopicOptions(false);
    setShowTitleOptions(false);
    setShowTypeOptions(false);
  }

  // Select or deselect a topic.
  function handleTopicToggle(topic: string) {
    setSelectedTopics((previous) =>
      previous.includes(topic)
        ? previous.filter((item) => item !== topic)
        : [...previous, topic]
    );

    // Reset title and type choices when topics change.
    setSelectedMaterialTitles([]);
    setSelectedMaterialTypes([]);
    setSelectedNoteId("");
    setErrorMessage("");
    setSuccessMessage("");
    setShowTitleOptions(false);
    setShowTypeOptions(false);
  }

  // Select or deselect a title.
  function handleTitleToggle(title: string) {
    setSelectedMaterialTitles((previous) =>
      previous.includes(title)
        ? previous.filter((item) => item !== title)
        : [...previous, title]
    );

    // Changing titles can change the available material types.
    setSelectedMaterialTypes([]);
    setSelectedNoteId("");
    setErrorMessage("");
    setSuccessMessage("");
  }

  // Select or deselect a material type.
  function handleMaterialTypeToggle(type: MaterialType) {
    setSelectedMaterialTypes((previous) =>
      previous.includes(type)
        ? previous.filter((item) => item !== type)
        : [...previous, type]
    );

    setErrorMessage("");
    setSuccessMessage("");
  }

  // Select or deselect all topics.
  function handleSelectAllTopics() {
    const allTopicsSelected =
      allTopics.length > 0 &&
      validSelectedTopics.length === allTopics.length;

    setSelectedTopics(allTopicsSelected ? [] : [...allTopics]);

    // Clear dependent selections after changing topics.
    setSelectedMaterialTitles([]);
    setSelectedMaterialTypes([]);
    setSelectedNoteId("");
    setErrorMessage("");
    setSuccessMessage("");
    setShowTitleOptions(false);
    setShowTypeOptions(false);
  }

  // Select all available titles 
  function handleSelectAllTitles() {
    const allTitlesSelected =
      materialTitles.length > 0 &&
      validSelectedTitles.length === materialTitles.length;

    setSelectedMaterialTitles(
      allTitlesSelected ? [] : [...materialTitles]
    );

    setSelectedMaterialTypes([]);
    setSelectedNoteId("");
    setErrorMessage("");
    setSuccessMessage("");
  }

  // Select all available material types 
  function handleSelectAllTypes() {
    const allTypesSelected =
      availableMaterialTypes.length > 0 &&
      validSelectedMaterialTypes.length === availableMaterialTypes.length;

    setSelectedMaterialTypes(
      allTypesSelected
        ? []
        : availableMaterialTypes.map((type) => type.value)
    );

    setErrorMessage("");
    setSuccessMessage("");
  }

  // Open a topic containing newly generated card
  function openGeneratedSet(cards: Flashcard[]) {
    const firstCard = cards[0];

    if (!firstCard) return;

    setShowGenerationForm(false);
    setViewSetKey(firstCard.topic);
    setCurrentCardIndex(0);
    setIsFlipped(false);
  }

  // Generate cards from a note or selected learning materials
  async function handleGenerateFlashcards() {
    setErrorMessage("");
    setSuccessMessage("");

    if (validSelectedTopics.length === 0) {
      setErrorMessage("Please select at least one topic.");
      return;
    }

    // Require title and type 
    if (validSelectedTitles.length === 0) {
      setErrorMessage("Please select at least one title.");
      return;
    }

    if (validSelectedMaterialTypes.length === 0) {
      setErrorMessage("Please select at least one material type.");
      return;
    }

    if (matchingMaterialIds.length === 0) {
      setErrorMessage(
        "No materials match your selected topics, titles and types."
      );
      return;
    }

    try {
      setIsGenerating(true);

      let generatedCards: Flashcard[] = [];

      if (selectedNoteId) {

        generatedCards = await generateFlashcardFromNote(
          selectedNoteId,
          numberOfCards,
          "medium"
        );
      } else {
        generatedCards = await generateFlashcardsFromMaterials(
          matchingMaterialIds,
          numberOfCards,
          "medium"
        );
      }

      if (!generatedCards?.length) {
        setSuccessMessage(
          "No flashcards were generated. Try materials with more explanatory content."
        );
        return;
      }

      // Use the returned topic(fall back) to the selected topic
      const fallbackTopic =
        validSelectedTopics.length === 1
          ? validSelectedTopics[0]
          : "Mixed Topics";

      const cardsToAdd: Flashcard[] = generatedCards.map(
        (card: Flashcard) => ({
          ...card,
          topic: card.topic || fallbackTopic,
        })
      );

      // Add the new cards without removing existing cards
      setFlashcards((previousCards) => [
        ...cardsToAdd,
        ...previousCards,
      ]);

      openGeneratedSet(cardsToAdd);

      setSuccessMessage(
        `${cardsToAdd.length} flashcard(s) added to ${fallbackTopic}.`
      );
    } catch {
      setErrorMessage("Unable to generate flashcards. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }

  // Flip the current flashcard
  function handleFlip() {
    setIsFlipped((previousValue) => !previousValue);
  }

  // Move to the next card
  function handleNextCard() {
    if (currentCardIndex < topicFlashcards.length - 1) {
      setCurrentCardIndex((previousIndex) => previousIndex + 1);
      setIsFlipped(false);
    }
  }

  // Move to the previous card
  function handlePreviousCard() {
    if (currentCardIndex > 0) {
      setCurrentCardIndex((previousIndex) => previousIndex - 1);
      setIsFlipped(false);
    }
  }

  // Close the modal
  function handleCloseStudy() {
    setViewSetKey(null);
    setCurrentCardIndex(0);
    setIsFlipped(false);
  }

  // Delete the currently displayed flashcard
  async function handleDeleteCard(card: Flashcard) {
    if (!card._id) {
      setErrorMessage("This flashcard has no valid ID.");
      return;
    }

    try {
      setErrorMessage("");

      await deleteFlashcard(card._id);

      const remainingCards = flashcards.filter(
        (item) => item._id !== card._id
      );

      setFlashcards(remainingCards);

      const remainingTopicCards = remainingCards.filter(
        (item) => item.topic === activeSet?.topic
      );

      if (remainingTopicCards.length === 0) {
        handleCloseStudy();
        return;
      }

      // Keep the index valid after deleting a card
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
        {/* Main page heading. */}
        <header className="mb-8">
          <p className="text-xs font-semibold tracking-[0.18em] text-[#71806D]">
            LEARN * REVISE * REMEMBER
          </p>

          <h1 className="mt-2 text-2xl font-bold leading-tight sm:text-3xl">
            Turn Learning into Lasting Memory
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#74675F] sm:text-base">
            Create flashcards from your learning materials and practise
            recalling what you know.
          </p>
        </header>

        {/* Error feedback */}
        {errorMessage && (
          <div
            role="alert"
            className="mb-5 rounded-xl border border-red-200 bg-white p-3 text-sm text-red-700"
          >
            {errorMessage}
          </div>
        )}

        {/* Success feedback */}
        {successMessage && (
          <div
            role="status"
            className="mb-5 rounded-xl border border-[#A3B19B] bg-white p-3 text-sm text-[#2D4030]"
          >
            {successMessage}
          </div>
        )}

        {/* Main page: generation card and saved topics */}
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          {/* Generation card */}
          <section className="rounded-2xl border border-[#E6D7CA] bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex h-24 w-28 items-center justify-center">
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

            <h2 className="text-base font-semibold sm:text-lg">
              Create flashcards
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#74675F]">
              Choose topics and generate cards for revision.
            </p>

            <button
              type="button"
              onClick={() => {
                setErrorMessage("");
                setSuccessMessage("");
                setShowGenerationForm(true);
              }}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#2D4030] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#405743]"
            >
              <Sparkles size={18} />
              Generate Flashcards
            </button>
          </section>

          {/* Each topic appears only once */}
          <section className="min-w-0">
            <h2 className="mb-1 text-lg font-semibold sm:text-xl">
              Your flashcards
            </h2>

            <p className="mb-5 text-sm leading-6 text-[#74675F]">
              Open a topic to revise all its flashcards.
            </p>

            {isLoading ? (
              <p className="rounded-xl bg-white p-5 text-sm text-[#74675F]">
                Loading your flashcards...
              </p>
            ) : flashcardSets.length === 0 ? (

          <div className="rounded-2xl border border-[#E6D7CA] bg-white p-6 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#D9A399]">
                <BookOpen size={23} />
              </div>

              <h3 className="font-semibold">No flashcards yet</h3>

              <p className="mt-2 text-sm leading-6 text-[#74675F]">
                Generate your first flashcards to begin revising.
              </p>
            </div>
              ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 2xl:grid-cols-3">
                {flashcardSets.map((set, index) => {
                  const topicNote = notes.find(
                    (note) => note.topic === set.topic
                  );

                  const topicColor = cardColors[index % cardColors.length];

                  return (
                    <article
                      key={set.key}
                      className="flex min-h-[220px] flex-col rounded-2xl border border-[#E6D7CA] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                    >
                      <div
                        className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl"
                        style={{ backgroundColor: topicColor }}
                      >
                        <Layers size={23} />
                      </div>

                      <h3 className="text-base font-semibold sm:text-lg">
                        {set.topic}
                      </h3>

                      <p className="mt-2 text-sm leading-5 text-[#74675F]">
                        {topicNote?.title ?? "Your saved flashcards"}
                      </p>

                      <div className="mt-auto flex items-center justify-between gap-2 pt-6">
                        <span className="rounded-full bg-[#E8EDE2] px-3 py-1.5 text-xs font-semibold text-[#2D4030]">
                          {set.cards.length}{" "}
                          {set.cards.length === 1 ? "card" : "cards"}
                        </span>

                        <button
                          type="button"
                          onClick={() => {
                            setViewSetKey(set.key);
                            setCurrentCardIndex(0);
                            setIsFlipped(false);
                            setErrorMessage("");
                            setSuccessMessage("");
                          }}
                          className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-[#2D4030] transition hover:bg-[#FDF3EC]"
                        >
                          Revise
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

        {/* Flashcard generation modal */}
        {showGenerationForm && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#2D4030]/60 p-3 sm:p-5"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget && !isGenerating) {
                handleCancelGeneration();
              }
            }}
          >
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="generation-title"
              className="my-auto w-full max-w-2xl rounded-2xl bg-white p-4 shadow-2xl sm:p-6"
            >
              <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                  <h2
                    id="generation-title"
                    className="text-lg font-bold sm:text-xl"
                  >
                    Generate Flashcards
                  </h2>

                  <p className="mt-1 text-sm text-[#74675F]">
                    Select a topic, then choose the titles and material types
                    you want to use.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCancelGeneration}
                  disabled={isGenerating}
                  aria-label="Close generation form"
                  className="rounded-lg p-2 transition hover:bg-[#FDF3EC] disabled:opacity-50"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Topic checklist. */}
                <div>
                  <label className="mb-1.5 block text-sm font-semibold">
                    1. Choose Topics
                  </label>

                  <button
                    type="button"
                    disabled={isGenerating || allTopics.length === 0}
                    onClick={() => {
                      setShowTopicOptions((previous) => !previous);
                      setShowTitleOptions(false);
                      setShowTypeOptions(false);
                    }}
                    className="flex w-full items-center justify-between rounded-lg border border-[#D7C8BB] bg-white px-3 py-2.5 text-left text-sm disabled:bg-gray-100"
                  >
                    <span>
                      {validSelectedTopics.length === 0
                        ? "Select topics"
                        : `${validSelectedTopics.length} topic(s) selected`}
                    </span>

                    {showTopicOptions ? (
                      <ChevronUp size={17} />
                    ) : (
                      <ChevronDown size={17} />
                    )}
                  </button>

                  {showTopicOptions && (
                    <div className="mt-2 max-h-48 space-y-2 overflow-y-auto rounded-lg border border-[#D7C8BB] bg-white p-3">
                      {allTopics.length > 1 && (
                        <label className="flex items-center gap-2 border-b border-[#E6D7CA] pb-2 text-sm font-semibold">
                          <input
                            type="checkbox"
                            disabled={isGenerating}
                            checked={
                              allTopics.length > 0 &&
                              validSelectedTopics.length === allTopics.length
                            }
                            onChange={handleSelectAllTopics}
                          />
                          Select All Topics
                        </label>
                      )}

                      {allTopics.map((topic) => (
                        <label
                          key={topic}
                          className="flex items-center gap-2 text-sm"
                        >
                          <input
                            type="checkbox"
                            disabled={isGenerating}
                            checked={validSelectedTopics.includes(topic)}
                            onChange={() => handleTopicToggle(topic)}
                          />

                          <span className="break-words">{topic}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {allTopics.length === 0 && (
                    <p className="mt-1 text-xs text-[#74675F]">
                      Add a note or Learning Material first.
                    </p>
                  )}
                </div>

                {/* Title checklist:- Disabled until a topic is selected */}
                <div>
                  <label className="mb-1.5 block text-sm font-semibold">
                    2. Choose Titles
                  </label>

                  {validSelectedTopics.length === 0 ? (
                    <div className="w-full rounded-lg border border-[#D7C8BB] bg-gray-100 px-3 py-2.5 text-sm text-[#74675F]">
                      Select a topic first
                    </div>
                  ) : materialTitles.length === 0 ? (
                    <div className="w-full rounded-lg border border-[#D7C8BB] bg-[#FDF3EC] px-3 py-2.5 text-sm text-[#74675F]">
                      No titles available
                    </div>
                  ) : materialTitles.length === 1 ? (
                    <label className="flex w-full items-center gap-2 rounded-lg border border-[#D7C8BB] bg-white px-3 py-2.5 text-sm">
                      <input
                        type="checkbox"
                        disabled={isGenerating}
                        checked={validSelectedTitles.includes(materialTitles[0])}
                        onChange={() => handleTitleToggle(materialTitles[0])}
                      />

                      <span className="break-words">{materialTitles[0]}</span>
                    </label>
                  ) : (
                    <>
                      <button
                        type="button"
                        disabled={isGenerating}
                        onClick={() => {
                          setShowTitleOptions((previous) => !previous);
                          setShowTopicOptions(false);
                          setShowTypeOptions(false);
                        }}
                        className="flex w-full items-center justify-between rounded-lg border border-[#D7C8BB] bg-white px-3 py-2.5 text-left text-sm disabled:bg-gray-100"
                      >
                        <span>
                          {validSelectedTitles.length === 0
                            ? "Select titles"
                            : `${validSelectedTitles.length} title(s) selected`}
                        </span>

                        {showTitleOptions ? (
                          <ChevronUp size={17} />
                        ) : (
                          <ChevronDown size={17} />
                        )}
                      </button>

                      {showTitleOptions && (
                        <div className="mt-2 max-h-48 space-y-2 overflow-y-auto rounded-lg border border-[#D7C8BB] bg-white p-3">
                          <label className="flex items-center gap-2 border-b border-[#E6D7CA] pb-2 text-sm font-semibold">
                            <input
                              type="checkbox"
                              disabled={isGenerating}
                              checked={
                                validSelectedTitles.length === materialTitles.length
                              }
                              onChange={handleSelectAllTitles}
                            />
                            All Titles
                          </label>

                          {materialTitles.map((title) => (
                            <label
                              key={title}
                              className="flex items-center gap-2 text-sm"
                            >
                              <input
                                type="checkbox"
                                disabled={isGenerating}
                                checked={validSelectedTitles.includes(title)}
                                onChange={() => handleTitleToggle(title)}
                              />

                              <span className="break-words">{title}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Material type checklist:- Follows the selected titles */}
                <div>
                  <label className="mb-1.5 block text-sm font-semibold">
                    3. Material Types
                  </label>

                  {validSelectedTopics.length === 0 ? (
                    <div className="w-full rounded-lg border border-[#D7C8BB] bg-gray-100 px-3 py-2.5 text-sm text-[#74675F]">
                      Select a topic first
                    </div>
                  ) : availableMaterialTypes.length === 0 ? (
                    <div className="w-full rounded-lg border border-[#D7C8BB] bg-[#FDF3EC] px-3 py-2.5 text-sm text-[#74675F]">
                      No types available
                    </div>
                  ) : availableMaterialTypes.length === 1 ? (
                    <label className="flex w-full items-center gap-2 rounded-lg border border-[#D7C8BB] bg-white px-3 py-2.5 text-sm">
                      <input
                        type="checkbox"
                        disabled={isGenerating}
                        checked={validSelectedMaterialTypes.includes(
                          availableMaterialTypes[0].value
                        )}
                        onChange={() =>
                          handleMaterialTypeToggle(
                            availableMaterialTypes[0].value
                          )
                        }
                      />

                      {availableMaterialTypes[0].label}
                    </label>
                  ) : (
                    <>
                      <button
                        type="button"
                        disabled={isGenerating}
                        onClick={() => {
                          setShowTypeOptions((previous) => !previous);
                          setShowTopicOptions(false);
                          setShowTitleOptions(false);
                        }}
                        className="flex w-full items-center justify-between rounded-lg border border-[#D7C8BB] bg-white px-3 py-2.5 text-left text-sm disabled:bg-gray-100"
                      >
                        <span>
                          {validSelectedMaterialTypes.length === 0
                            ? "Select material types"
                            : `${validSelectedMaterialTypes.length} type(s) selected`}
                        </span>

                        {showTypeOptions ? (
                          <ChevronUp size={17} />
                        ) : (
                          <ChevronDown size={17} />
                        )}
                      </button>

                      {showTypeOptions && (
                        <div className="mt-2 max-h-48 space-y-2 overflow-y-auto rounded-lg border border-[#D7C8BB] bg-white p-3">
                          <label className="flex items-center gap-2 border-b border-[#E6D7CA] pb-2 text-sm font-semibold">
                            <input
                              type="checkbox"
                              disabled={isGenerating}
                              checked={
                                validSelectedMaterialTypes.length ===
                                availableMaterialTypes.length
                              }
                              onChange={handleSelectAllTypes}
                            />
                            All Types
                          </label>

                          {availableMaterialTypes.map((type) => (
                            <label
                              key={type.value}
                              className="flex items-center gap-2 text-sm"
                            >
                              <input
                                type="checkbox"
                                disabled={isGenerating}
                                checked={validSelectedMaterialTypes.includes(
                                  type.value
                                )}
                                onChange={() =>
                                  handleMaterialTypeToggle(type.value)
                                }
                              />

                              {type.label}
                            </label>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Number of cards to generate */}
                <div>
                  <label
                    htmlFor="card-count"
                    className="mb-1.5 block text-sm font-semibold"
                  >
                    4. Number of Cards
                  </label>

                  <select
                    id="card-count"
                    value={numberOfCards}
                    disabled={isGenerating}
                    onChange={(event) =>
                      setNumberOfCards(Number(event.target.value))
                    }
                    className="w-full rounded-lg border border-[#D7C8BB] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#2D4030] disabled:bg-gray-100"
                  >
                    <option value={5}>5 cards</option>
                    <option value={10}>10 cards</option>
                    <option value={15}>15 cards</option>
                    <option value={20}>20 cards</option>
                  </select>
                </div>
              </div>

              {/* Explain when the current selections match no materials */}
              {validSelectedTopics.length > 0 &&
                validSelectedTitles.length > 0 &&
                validSelectedMaterialTypes.length > 0 &&
                matchingMaterialIds.length === 0 && (
                  <p className="mt-3 rounded-lg bg-[#FDF3EC] p-3 text-xs leading-5 text-[#74675F]">
                    No materials match your selected topics, titles and types.
                  </p>
                )}

              <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleCancelGeneration}
                  disabled={isGenerating}
                  className="rounded-lg border border-[#D7C8BB] px-5 py-2.5 text-sm font-semibold text-[#2D4030] transition hover:bg-[#FDF3EC] disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleGenerateFlashcards}
                  disabled={
                    isGenerating ||
                    validSelectedTopics.length === 0 ||
                    validSelectedTitles.length === 0 ||
                    validSelectedMaterialTypes.length === 0 ||
                    matchingMaterialIds.length === 0
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#2D4030] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#405743] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Sparkles size={17} />
                  {isGenerating ? "Generating..." : "Generate Flashcards"}
                </button>
              </div>
            </section>
          </div>
        )}

        {/* Revision modal:- All cards for the chosen topic */}
        {viewSetKey && activeSet && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-hidden bg-[#2D4030]/60 p-2 sm:p-4">
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="study-title"
              className="flex max-h-[calc(100dvh-1rem)] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-[#FDF3EC] p-3 shadow-2xl sm:max-h-[calc(100dvh-2rem)] sm:p-5"
            >
              <div className="flex shrink-0 items-center justify-between gap-3">
                <div className="min-w-0">
                  <h2
                    id="study-title"
                    className="truncate text-xl font-bold sm:text-2xl"
                  >
                    {activeSet.topic}
                  </h2>

                  <p className="mt-1 text-sm text-[#74675F]">
                    Revise all flashcards in this topic.
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

              {/* Display all cards in this topic */}
              {topicFlashcards.length > 0 ? (
                <>
                  <div className="mt-4 flex shrink-0 items-center justify-between text-xs sm:text-sm">
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

                  {currentCard && (
                    <div className="flex min-h-0 flex-1 items-center justify-center gap-1 py-3 sm:gap-4">
                      <button
                        type="button"
                        onClick={handlePreviousCard}
                        disabled={currentCardIndex === 0}
                        aria-label="Previous flashcard"
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#2D4030] shadow-sm transition hover:bg-[#E8EDE2] disabled:cursor-not-allowed disabled:opacity-30 sm:h-12 sm:w-12"
                      >
                        <ChevronLeft size={24} />
                      </button>

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

                      <button
                        type="button"
                        onClick={handleNextCard}
                        disabled={
                          currentCardIndex === topicFlashcards.length - 1
                        }
                        aria-label="Next flashcard"
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2D4030] text-white shadow-sm transition hover:bg-[#405743] disabled:cursor-not-allowed disabled:opacity-30 sm:h-12 sm:w-12"
                      >
                        <ChevronRight size={24} />
                      </button>
                    </div>
                  )}

                  {/* Delete the current card */}
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
                </>
              ) : (
                <div className="flex min-h-[220px] flex-1 flex-col items-center justify-center px-4 text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#E8EDE2]">
                    <BookOpen size={24} />
                  </div>

                  <h3 className="font-semibold">No flashcards yet</h3>

                  <p className="mt-2 max-w-sm text-sm leading-6 text-[#74675F]">
                    Generate flashcards for {activeSet.topic}, then return here
                    to revise them.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTopics([activeSet.topic]);
                      setSelectedMaterialTitles([]);
                      setSelectedMaterialTypes([]);
                      setViewSetKey(null);
                      setShowGenerationForm(true);
                    }}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#2D4030] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#405743]"
                  >
                    <Sparkles size={16} />
                    Generate Flashcards
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