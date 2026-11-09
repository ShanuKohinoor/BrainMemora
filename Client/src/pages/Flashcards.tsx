
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router";
import {
  BookOpen,
  ArrowRight,
  X,
  Layers,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Trash2,
} from "lucide-react";

import FlashcardAssessment from "../components/FlashcardAssessment";
import { DashboardLayout } from "../components/DashboardLayout";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { fetchNotes } from "../features/notes/noteSlice";
import { fetchLearningMaterials } from "../features/learningMaterials/learningMaterialSlice";

import {
  getAllFlashcards,
  deleteFlashcard,
  generateFlashcardFromNote,
  generateFlashcardsFromMaterials,
  completeFlashcardReview,
} from "../services/flashCardService";

import type { Flashcard } from "../types/flashcard.types";
import type { MaterialType } from "../types/learningMaterial.types";

// A title represents one independently revisable flashcard set.
type FlashcardTitleSet = {
  key: string;
  title: string;
  cards: Flashcard[];
};

// A topic contains multiple title-based flashcard sets.
type FlashcardTopicSet = {
  topic: string;
  titleSets: FlashcardTitleSet[];
};

const cardColors = ["#A7C1D0", "#D9A399", "#F2D69B", "#B5CDA8"];

const materialTypes: { value: MaterialType; label: string }[] = [
  { value: "pdf", label: "PDF" },
  { value: "video", label: "Video" },
  { value: "url", label: "URL" },
  { value: "audio", label: "Audio" },
  { value: "image", label: "Image" },
];

export default function Flashcards() {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const handledMaterialId = useRef<string | null>(null);

  const materialId = location.state?.materialId;

  const notes = useAppSelector((state) => state.notes.notes);
  const materials = useAppSelector(
    (state) => state.learningMaterials.materials
  );

  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [materialFlashcards, setMaterialFlashcards] =
    useState<Flashcard[] | null>(null);
  const [showGenerationForm, setShowGenerationForm] = useState(false);

  // Store the key of the title-based set being revised.
  const [selectedFlashcardSet, setSelectedFlashcardSet] =
    useState<string | null>(null);

  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState("");

  const [selectedMaterialTitles, setSelectedMaterialTitles] =
    useState<string[]>([]);
  const [selectedMaterialTypes, setSelectedMaterialTypes] =
    useState<MaterialType[]>([]);

  const [showTopicOptions, setShowTopicOptions] = useState(false);
  const [showTitleOptions, setShowTitleOptions] = useState(false);
  const [showTypeOptions, setShowTypeOptions] = useState(false);

  const [numberOfCards, setNumberOfCards] = useState(10);

  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Store the flashcard set waiting for delete confirmation.
  const [pendingDeleteSet, setPendingDeleteSet] =
    useState<FlashcardTitleSet | null>(null);

  const [isDeletingSet, setIsDeletingSet] = useState(false);

  // Load notes, materials and saved flashcards.
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
        setErrorMessage("Unable to load your flashcards. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadFlashcards();
  }, [dispatch]);

  // Generate or open flashcards for one selected learning material.
  useEffect(() => {
    if (
      !materialId ||
      isLoading ||
      handledMaterialId.current === materialId
    ) {
      return;
    }

    const selectedMaterial = materials.find(
      (material) => material._id === materialId
    );

    if (!selectedMaterial) return;

    handledMaterialId.current = materialId;

    async function openMaterialFlashcards() {
      try {
        setIsGenerating(true);
        setErrorMessage("");
        setSuccessMessage("");

        const existingCards = flashcards.filter((card) =>
          card.sources?.some(
            (source) =>
              source.sourceId === materialId &&
              source.sourceType === "learningMaterial"
          )
        );

        if (existingCards.length > 0) {
          setMaterialFlashcards(existingCards);
          return;
        }

        const generatedCards = await generateFlashcardsFromMaterials(
          [materialId],
          numberOfCards,
          "medium"
        );

        if (!generatedCards?.length) {
          setErrorMessage(
            "No flashcards could be generated from this material."
          );
          return;
        }

        setFlashcards((previousCards) => [
          ...generatedCards,
          ...previousCards,
        ]);

        setMaterialFlashcards(generatedCards);

        setSuccessMessage(
          `${generatedCards.length} flashcard(s) generated successfully.`
        );
      } catch {
        setErrorMessage(
          "Unable to generate flashcards from this material. Please try again."
        );
      } finally {
        setIsGenerating(false);
      }
    }

    void openMaterialFlashcards();
  }, [materialId, isLoading, materials, flashcards, numberOfCards]);

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

  // Combine topics from notes and materials.
  const allTopics = Array.from(
    new Set([...noteTopics, ...materialTopics])
  ).sort();

  const validSelectedTopics = selectedTopics.filter((topic) =>
    allTopics.includes(topic)
  );

  // Filter materials by selected topics.
  const materialsForTopic = materials.filter(
    (material) =>
      material._id &&
      validSelectedTopics.includes(material.topic?.trim() ?? "")
  );

  // Get available titles for selected topics.
  const materialTitles = Array.from(
    new Set(
      materialsForTopic
        .map((material) => material.title.trim())
        .filter(Boolean)
    )
  ).sort();

  const validSelectedTitles = selectedMaterialTitles.filter((title) =>
    materialTitles.includes(title)
  );

  // Get available material types.
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

  const validSelectedMaterialTypes = selectedMaterialTypes.filter((type) =>
    availableMaterialTypes.some(
      (availableType) => availableType.value === type
    )
  );

  // Get materials matching the selected titles and types.
  const visibleMaterials = materialsForTopic.filter(
    (material) =>
      validSelectedTitles.includes(material.title.trim()) &&
      validSelectedMaterialTypes.includes(material.type)
  );

  const matchingMaterialIds = visibleMaterials
    .map((material) => material._id)
    .filter((id): id is string => Boolean(id));

  // Group flashcards first by topic and then by title.
  const flashcardSets: FlashcardTopicSet[] = [];

  for (const card of flashcards) {
    if (!card.topic?.trim()) continue;

    const topic = card.topic.trim();
    const title = card.title?.trim() || "General";

    let topicSet = flashcardSets.find(
      (item) => item.topic === topic
    );

    if (!topicSet) {
      topicSet = {
        topic,
        titleSets: [],
      };

      flashcardSets.push(topicSet);
    }

    let titleSet = topicSet.titleSets.find(
      (item) => item.title === title
    );

    if (!titleSet) {
      titleSet = {
        key: JSON.stringify([topic, title]),
        title,
        cards: [],
      };

      topicSet.titleSets.push(titleSet);
    }

    titleSet.cards.push(card);
  }

  // Sort topics and titles alphabetically.
  flashcardSets.sort((a, b) =>
    a.topic.localeCompare(b.topic)
  );

  flashcardSets.forEach((topicSet) => {
    topicSet.titleSets.sort((a, b) =>
      a.title.localeCompare(b.title)
    );
  });

  // Find only the selected title-based flashcard set.
  const activeSet =
    flashcardSets
      .flatMap((topicSet) => topicSet.titleSets)
      .find((set) => set.key === selectedFlashcardSet) ?? null;

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

  // Select all topics or clear the selection.
  function handleSelectAllTopics() {
    const allTopicsSelected =
      allTopics.length > 0 &&
      validSelectedTopics.length === allTopics.length;

    setSelectedTopics(allTopicsSelected ? [] : [...allTopics]);

    setSelectedMaterialTitles([]);
    setSelectedMaterialTypes([]);
    setSelectedNoteId("");
    setErrorMessage("");
    setSuccessMessage("");
    setShowTitleOptions(false);
    setShowTypeOptions(false);
  }

  // Select all titles or clear the selection.
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

  // Select all material types or clear the selection.
  function handleSelectAllTypes() {
    const allTypesSelected =
      availableMaterialTypes.length > 0 &&
      validSelectedMaterialTypes.length ===
        availableMaterialTypes.length;

    setSelectedMaterialTypes(
      allTypesSelected
        ? []
        : availableMaterialTypes.map((type) => type.value)
    );

    setErrorMessage("");
    setSuccessMessage("");
  }

  // Open the title set containing the generated flashcards.
  function openGeneratedSet(cards: Flashcard[]) {
    const firstCard = cards[0];

    if (!firstCard?.topic) return;

    const topic = firstCard.topic.trim();
    const title = firstCard.title?.trim() || "General";

    setMaterialFlashcards(null);
    setShowGenerationForm(false);
    setSelectedFlashcardSet(JSON.stringify([topic, title]));
  }

  // Generate flashcards from selected materials or a note.
  async function handleGenerateFlashcards() {
    setErrorMessage("");
    setSuccessMessage("");

    if (validSelectedTopics.length === 0) {
      setErrorMessage("Please select at least one topic.");
      return;
    }

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

      const fallbackTopic =
        validSelectedTopics.length === 1
          ? validSelectedTopics[0]
          : "Mixed Topics";

      // Keep the generated topic and title, using fallbacks if missing.
      const cardsToAdd: Flashcard[] = generatedCards.map(
        (card: Flashcard) => ({
          ...card,
          topic: card.topic?.trim() || fallbackTopic,
          title:
            card.title?.trim() ||
            (validSelectedTitles.length === 1
              ? validSelectedTitles[0]
              : "General"),
        })
      );

      setFlashcards((previousCards) => [
        ...cardsToAdd,
        ...previousCards,
      ]);

      openGeneratedSet(cardsToAdd);

      setSuccessMessage(
        `${cardsToAdd.length} flashcard(s) generated successfully.`
      );
    } catch {
      setErrorMessage("Unable to generate flashcards. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }

  // Close the flashcard assessment.
  function handleCloseStudy() {
    setSelectedFlashcardSet(null);
    setMaterialFlashcards(null);
  }

  // Record a completed flashcard review for rewards.
  async function handleCompleteReview() {
    const cardsToReview = materialFlashcards ?? activeSet?.cards;

    if (!cardsToReview?.length) return;

    await completeFlashcardReview(
      cardsToReview[0]?.topic ?? "",
      cardsToReview[0]?.title ?? "General"
    );

    setSuccessMessage("Flashcard review completed successfully!");
  }

  // Delete a single flashcard from the assessment.
  async function handleDeleteCard(card: Flashcard) {
    if (!card._id) {
      setErrorMessage("This flashcard has no valid ID.");
      return;
    }

    try {
      setErrorMessage("");

      await deleteFlashcard(card._id);

      setFlashcards((previousCards) =>
        previousCards.filter((item) => item._id !== card._id)
      );

      setMaterialFlashcards((previousCards) =>
        previousCards
          ? previousCards.filter((item) => item._id !== card._id)
          : null
      );
    } catch {
      setErrorMessage("Unable to delete the flashcard. Please try again.");
    }
  }

  // Open the delete confirmation modal.
  function handleDeleteSet(titleSet: FlashcardTitleSet) {
    setPendingDeleteSet(titleSet);
  }

  // Cancel deletion and close the modal.
  function handleCancelDelete() {
    if (isDeletingSet) return;

    setPendingDeleteSet(null);
  }

  // Delete the set only after confirmation.
  async function handleConfirmDelete() {
    if (!pendingDeleteSet) return;

    try {
      setIsDeletingSet(true);
      setErrorMessage("");
      setSuccessMessage("");

      const titleSet = pendingDeleteSet;
      const cardIds = titleSet.cards.map((card) => card._id);

      if (cardIds.some((id) => !id)) {
        setErrorMessage(
          "Some flashcards have no valid ID. Unable to delete this set."
        );
        return;
      }

      // Delete all cards in the selected set.
      await Promise.all(
        cardIds.map((id) => deleteFlashcard(id!))
      );

      // Update saved flashcards.
      setFlashcards((previousCards) =>
        previousCards.filter(
          (card) => !cardIds.includes(card._id)
        )
      );

      // Update currently displayed flashcards.
      setMaterialFlashcards((previousCards) =>
        previousCards
          ? previousCards.filter(
              (card) => !cardIds.includes(card._id)
            )
          : null
      );

      // Close the assessment if this set was open.
      if (selectedFlashcardSet === titleSet.key) {
        setSelectedFlashcardSet(null);
        setMaterialFlashcards(null);
      }

      setPendingDeleteSet(null);

      setSuccessMessage(
        `"${titleSet.title}" and its ${titleSet.cards.length} flashcards were deleted successfully.`
      );
    } catch {
      setErrorMessage(
        "Unable to delete the complete flashcard set. Please try again."
      );
    } finally {
      setIsDeletingSet(false);
    }
  }

  return (
    <DashboardLayout
      backLabel="Back to Library"
      backTo="/allLearningMaterials"
    >
      <main className="min-h-screen bg-[#FDF3EC] px-4 py-6 text-[#2D4030] sm:px-6 lg:px-8">

        {/* Main heading and Create Flashcards card */}
        <header className="mb-8">
          <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-2">
            {/* Left side: Main page heading */}
            <div>
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
            </div>

            {/* Right side: Create Flashcards card */}
            <section className="mt-10 w-full max-w-[300px] justify-self-end rounded-2xl border border-[#E6D7CA] bg-white p-4 shadow-sm">

              <div className="mb-3 flex h-16 items-center justify-center">
                <div className="relative h-16 w-20">
                  <div className="absolute left-7 top-1 h-[54px] w-[42px] rotate-[12deg] rounded-lg border border-[#2D4030]/10 bg-[#B5CDA8] shadow-sm" />

                  <div className="absolute left-2 top-1 h-[54px] w-[42px] -rotate-[12deg] rounded-lg border border-[#2D4030]/10 bg-[#D9A399] shadow-sm" />

                  <div className="absolute left-4 top-1 flex h-[54px] w-[42px] flex-col items-center justify-center rounded-lg border border-[#2D4030]/10 bg-[#A7C1D0] shadow-md">
                    <BookOpen size={17} strokeWidth={1.8} className="text-[#2D4030]" />

                    <div className="mt-2 space-y-1">
                      <div className="h-1 w-5 rounded-full bg-[#2D4030]/50" />
                      <div className="h-1 w-6 rounded-full bg-[#2D4030]/30" />
                    </div>
                  </div>
                </div>
              </div>

              <h2 className="text-base font-bold text-[#2D4030]">
                Create flashcards
              </h2>

              <p className="mt-1 text-xs leading-5 text-[#6B625C]">
                Choose topics and generate cards for revision.
              </p>

              <button
                type="button"
                onClick={() => {
                  setErrorMessage("");
                  setSuccessMessage("");
                  setShowGenerationForm(true);
                }}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#F27A58] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#df6948]"
              >
                <Sparkles size={15} />
                Generate Flashcards
              </button>
            </section>
          </div>
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

        {/* Saved flashcards grouped by topic and title */}
        <section className="min-w-0">
          <div className="mb-5">
            <h2 className="text-lg font-semibold sm:text-xl">
              Your flashcards
            </h2>

            <p className="mt-1 text-sm leading-6 text-[#74675F]">
              Choose a topic and revise each title separately.
            </p>
          </div>

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
            <div className="space-y-5">
              {flashcardSets.map((topicSet, index) => {
                const topicColor =
                  cardColors[index % cardColors.length];

                const totalCards = topicSet.titleSets.reduce(
                  (total, titleSet) => total + titleSet.cards.length,
                  0
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
                            {topicSet.titleSets.length}{" "}
                            {topicSet.titleSets.length === 1
                              ? "flashcard set"
                              : "flashcard sets"}
                          </p>
                        </div>
                      </div>

                      <span className="shrink-0 rounded-full bg-[#E8EDE2] px-3 py-1.5 text-xs font-semibold text-[#2D4030]">
                        {totalCards} cards
                      </span>
                    </div>

                    {/* Separate title sets inside the topic */}
                    <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-3">
                      {topicSet.titleSets.map((titleSet, titleIndex) => {
                        const cardColor =
                          cardColors[titleIndex % cardColors.length];

                        return (
                          <article
                            key={titleSet.key}
                            className="flex flex-col justify-between rounded-xl border border-[#E6D7CA] p-4 transition hover:border-[#A3B19B] hover:shadow-sm"
                            style={{ backgroundColor: cardColor }}
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#FDF3EC]">
                                <BookOpen
                                  size={19}
                                  className="text-[#2D4030]"
                                />
                              </div>

                              <div className="min-w-0">
                                <h4 className="break-words text-sm font-semibold text-[#2D4030]">
                                  {titleSet.title}
                                </h4>

                                <p className="mt-1 text-xs text-[#74675F]">
                                  {titleSet.cards.length}{" "}
                                  {titleSet.cards.length === 1
                                    ? "flashcard"
                                    : "flashcards"}
                                </p>
                              </div>
                            </div>

                            {/* Revise and Delete buttons */}
                            <div className="mt-4 flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setMaterialFlashcards(null);
                                  setSelectedFlashcardSet(titleSet.key);
                                  setErrorMessage("");
                                  setSuccessMessage("");
                                }}
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#2D4030] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#405743]"
                              >
                                Revise
                                <ArrowRight size={16} />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteSet(titleSet)}
                                aria-label={`Delete ${titleSet.title} flashcard set`}
                                title="Delete flashcard set"
                                className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-red-600 transition hover:bg-red-50"
                              >
                                <Trash2 size={17} />
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
        </section>

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
              {/* Modal heading */}
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
                {/* Topic checklist */}
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

                {/* Title checklist */}
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

                      <span className="break-words">
                        {materialTitles[0]}
                      </span>
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
                                validSelectedTitles.length ===
                                materialTitles.length
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

                {/* Material type checklist */}
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

                {/* Number of cards */}
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

              {/* Show a message when no materials match */}
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

        {/* Delete confirmation modal */}
        {pendingDeleteSet && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#2D4030]/60 p-4">
            <section
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="delete-title"
              aria-describedby="delete-description"
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            >
              <h2
                id="delete-title"
                className="text-lg font-bold text-[#2D4030]"
              >
                Delete flashcard set?
              </h2>

              <p
                id="delete-description"
                className="mt-2 text-sm leading-6 text-[#74675F]"
              >
                Are you sure you want to delete{" "}
                <strong>{pendingDeleteSet.title}</strong> and all{" "}
                <strong>{pendingDeleteSet.cards.length} flashcards</strong>{" "}
                in this set? This action cannot be undone.
              </p>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCancelDelete}
                  disabled={isDeletingSet}
                  className="rounded-lg border border-[#D7C8BB] px-4 py-2.5 text-sm font-semibold text-[#2D4030] transition hover:bg-[#FDF3EC] disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={isDeletingSet}
                  className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isDeletingSet ? "Deleting..." : "Confirm Delete"}
                </button>
              </div>
            </section>
          </div>
        )}

        {/* Open only the selected topic and title set */}
        {materialFlashcards !== null ? (
          materialFlashcards.length > 0 && (
            <FlashcardAssessment
              topic={materialFlashcards[0]?.title ?? "Flashcards"}
              flashcards={materialFlashcards}
              onClose={handleCloseStudy}
              onDeleteCard={handleDeleteCard}
              onCompleted={handleCompleteReview}
            />
          )
        ) : (
          activeSet && (
            <FlashcardAssessment
              topic={activeSet.title}
              flashcards={activeSet.cards}
              onClose={handleCloseStudy}
              onDeleteCard={handleDeleteCard}
              onCompleted={handleCompleteReview}
            />
          )
        )}
      </main>
    </DashboardLayout>
  );
}
