
import { useEffect, useRef, useState } from "react";
import {
    BookOpen,
    X,
    ChevronLeft,
    ChevronRight,
    RotateCw,
    Sparkles,
} from "lucide-react";

import type { Flashcard } from "../types/flashcard.types";

interface FlashcardAssessmentProps {
    topic: string;
    flashcards: Flashcard[];
    onClose: () => void;
    onDeleteCard?: (card: Flashcard) => void;
    onGenerateFlashcards?: () => void;
    onCompleted?: () => void | Promise<void>;
}

const cardColors = ["#A7C1D0", "#D9A399", "#F2D69B", "#B5CDA8"];

export default function FlashcardAssessment({
    topic,
    flashcards,
    onClose,
    onDeleteCard,
    onGenerateFlashcards,
    onCompleted,
}: FlashcardAssessmentProps) {
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    // Store the IDs of cards that the user has viewed.
    const [viewedCardIds, setViewedCardIds] = useState<string[]>([]);

    // Track whether the completion request is being saved.
    const [isCompletingReview, setIsCompletingReview] = useState(false);

    // Track whether completion was successfully saved.
    const [isReviewCompleted, setIsReviewCompleted] = useState(false);

    // Prevent duplicate completion requests.
    const completionSent = useRef(false);

    const currentCard = flashcards[currentCardIndex];

    // Keep the current card index valid if a card is deleted.
    useEffect(() => {
        if (currentCardIndex >= flashcards.length) {
            setCurrentCardIndex(Math.max(0, flashcards.length - 1));
            setIsFlipped(false);
        }
    }, [flashcards.length, currentCardIndex]);

    // Check whether all flashcards have been viewed.
    const allCardsViewed =
        flashcards.length > 0 &&
        flashcards.every((card) =>
            viewedCardIds.includes(card._id)
        );

    // Flip the current card and record it when its answer is revealed.
    function handleFlip() {
        if (!currentCard) return;

        if (!isFlipped) {
            setViewedCardIds((previousIds) =>
                previousIds.includes(currentCard._id)
                    ? previousIds
                    : [...previousIds, currentCard._id]
            );
        }

        setIsFlipped((previousValue) => !previousValue);
    }

    // Move to the next card.
    function handleNextCard() {
        if (currentCardIndex < flashcards.length - 1) {
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

    // Save completion only when the user clicks Finish Review.
    async function handleFinishReview() {
        if (
            !onCompleted ||
            !allCardsViewed ||
            isCompletingReview ||
            completionSent.current
        ) {
            return;
        }

        try {
            setIsCompletingReview(true);

            await onCompleted();

            completionSent.current = true;
            setIsReviewCompleted(true);
        } catch (error) {
            console.error("Error completing flashcard review:", error);
        } finally {
            setIsCompletingReview(false);
        }
    }

    // Reset the assessment when it closes.
    function handleClose() {
        setCurrentCardIndex(0);
        setIsFlipped(false);
        setViewedCardIds([]);
        setIsCompletingReview(false);
        setIsReviewCompleted(false);
        completionSent.current = false;

        onClose();
    }

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-hidden bg-[#2D4030]/60 p-2 sm:p-4">
            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="study-title"
                className="flex max-h-[calc(100dvh-1rem)] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-[#FDF3EC] p-3 shadow-2xl sm:max-h-[calc(100dvh-2rem)] sm:p-5"
            >
                {/* Header */}
                <div className="flex shrink-0 items-center justify-between gap-3">
                    <div className="min-w-0">
                        <h2
                            id="study-title"
                            className="truncate text-xl font-bold sm:text-2xl"
                        >
                            {topic}
                        </h2>

                        <p className="mt-1 text-sm text-[#74675F]">
                            Revise all flashcards in this topic.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleClose}
                        aria-label="Close flashcards"
                        className="shrink-0 rounded-xl p-2 transition hover:bg-[#E8EDE2]"
                    >
                        <X size={21} />
                    </button>
                </div>

                {/* Flashcards */}
                {flashcards.length > 0 ? (
                    <>
                        <div className="mt-4 flex shrink-0 items-center justify-between text-xs sm:text-sm">
                            <span className="font-semibold">
                                Card {currentCardIndex + 1} of {flashcards.length}
                            </span>

                            <span className="text-[#74675F]">
                                {isFlipped ? "Answer" : "Question"}
                            </span>
                        </div>

                        {/* Navigation progress bar */}
                        <div className="mt-2 h-1.5 shrink-0 overflow-hidden rounded-full bg-[#E6D7CA]">
                            <div
                                className="h-full rounded-full bg-[#F27A58] transition-all duration-300"
                                style={{
                                    width: `${
                                        ((currentCardIndex + 1) / flashcards.length) * 100
                                    }%`,
                                }}
                            />
                        </div>

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

                                {/* Flip card */}
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
                                    disabled={currentCardIndex === flashcards.length - 1}
                                    aria-label="Next flashcard"
                                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2D4030] text-white shadow-sm transition hover:bg-[#405743] disabled:cursor-not-allowed disabled:opacity-30 sm:h-12 sm:w-12"
                                >
                                    <ChevronRight size={24} />
                                </button>
                            </div>
                        )}


                        {/* Finish Review button: Learning Sessions only */}
{/* Finish Review and Delete buttons */}
<div className="flex shrink-0 flex-col items-center gap-3 pb-2">

    {onCompleted && (
        <p className="text-sm text-[#74675F]">
            Reviewed {viewedCardIds.length} of {flashcards.length} cards
        </p>
    )}

    <div className="flex items-center justify-center gap-3">
        {onCompleted && (
            <button
                type="button"
                onClick={handleFinishReview}
                disabled={!allCardsViewed || isCompletingReview || isReviewCompleted}
                className="rounded-xl bg-[#2D4030] px-6 py-3 font-semibold text-white transition hover:bg-[#405743] disabled:cursor-not-allowed disabled:opacity-40"
            >
                {isCompletingReview
                    ? "Saving completion..."
                    : isReviewCompleted
                        ? "Completed!"
                        : "Finish Review"}
            </button>
        )}

        {currentCard && onDeleteCard && (
            <button
                type="button"
                onClick={() => onDeleteCard(currentCard)}
                className="rounded-lg px-3 py-2 text-xs font-semibold text-[#9A4432] transition hover:bg-white sm:text-sm"
            >
                Delete this card
            </button>
        )}
    </div>
</div>
            </>
                ) : (
                    <div className="flex min-h-[220px] flex-1 flex-col items-center justify-center px-4 text-center">
                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#E8EDE2]">
                            <BookOpen size={24} />
                        </div>

                        <h3 className="font-semibold">No flashcards yet</h3>

                        <p className="mt-2 max-w-sm text-sm leading-6 text-[#74675F]">
                            Generate flashcards for {topic}, then return here to revise them.
                        </p>

                        {onGenerateFlashcards && (
                            <button
                                type="button"
                                onClick={onGenerateFlashcards}
                                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#2D4030] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#405743]"
                            >
                                <Sparkles size={16} />
                                Generate Flashcards
                            </button>
                        )}
                    </div>
                )}
            </section>
        </div>
    );
}
