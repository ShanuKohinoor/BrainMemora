
import { useState } from "react";
import { Pencil, Trash2, Check, X } from "lucide-react";
import type { MaterialType } from "../types/learningMaterial.types";

interface CardProps {
  _id: string;
  title: string;
  topic: string;
  color: string;                 // Background color for learning material card
  description?: string;
  type?: MaterialType;
  fileUrl?: string;
  externalUrl?: string;
  hasExtractedText: boolean;
  onGenerateFlashcards: () => void;
  onGenerateQuiz: () => void;
  onDelete: (id: string) => Promise<void>;
  onUpdate: (
    id: string,
    data: { title: string; topic: string; type: MaterialType }
  ) => Promise<boolean>;
  isDeleting: boolean;
  isUpdating: boolean;
}

export function Card({
  _id,
  title,
  topic,
  color,
  description,
  type,
  fileUrl,
  externalUrl,
  hasExtractedText,
  onGenerateFlashcards,
  onGenerateQuiz,
  onDelete,
  onUpdate,
  isDeleting,
  isUpdating,
}: CardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(title);
  const [newTopic, setNewTopic] = useState(topic);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [formError, setFormError] = useState("");

  const isYoutubeVideo =
    externalUrl?.includes("youtube.com") ||
    externalUrl?.includes("youtu.be");

  // Save the material without asking for confirmation.
  const handleSave = async () => {
    if (!newTitle.trim() || !newTopic.trim()) {
      setFormError("Title and topic are required.");
      return;
    }

    setFormError("");

    const success = await onUpdate(_id, {
      title: newTitle.trim(),
      topic: newTopic.trim(),
      type: type ?? "url",
    });

    if (success) {
      setIsEditing(false);
    }
  };

  // Cancel editing and restore the original values.
  const handleCancelEdit = () => {
    setNewTitle(title);
    setNewTopic(topic);
    setFormError("");
    setIsEditing(false);
  };

  // Delete the material after the in-card confirmation.
  const handleConfirmDelete = async () => {
    await onDelete(_id);
    setShowDeleteConfirmation(false);
  };

  return (
    <div
      className="relative flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-[#E8DED3] bg-[#FDF3EC] p-5 shadow-sm transition-shadow hover:shadow-md"
      style={{ backgroundColor: color }}
    >
      {isEditing ? (
        <div className="flex flex-1 flex-col">
          <h3 className="mb-4 text-lg font-semibold text-[#2D4030]">
            Edit Material
          </h3>

          <label className="mb-1 text-sm font-medium text-[#2D4030]">
            Title
          </label>

          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Enter material title"
            className="mb-3 w-full rounded-lg border border-[#D7C8BB] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#A3B19B]"
          />

          <label className="mb-1 text-sm font-medium text-[#2D4030]">
            Topic
          </label>

          <input
            value={newTopic}
            onChange={(e) => setNewTopic(e.target.value)}
            placeholder="Enter topic"
            className="mb-3 w-full rounded-lg border border-[#D7C8BB] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#A3B19B]"
          />

          {formError && (
            <p className="mb-3 text-sm text-red-600" role="alert">
              {formError}
            </p>
          )}

          <div className="mt-auto flex flex-wrap gap-2 pt-3">
            <button
              type="button"
              disabled={isUpdating || isDeleting}
              onClick={() => void handleSave()}
              className="flex items-center gap-2 rounded-lg bg-[#2D4030] px-4 py-2 text-sm font-medium text-white hover:bg-[#405943] disabled:opacity-50"
            >
              <Check size={16} />
              {isUpdating ? "Saving..." : "Save"}
            </button>

            <button
              type="button"
              disabled={isUpdating}
              onClick={handleCancelEdit}
              className="flex items-center gap-2 rounded-lg border border-[#D7C8BB] px-4 py-2 text-sm text-[#2D4030] hover:bg-white disabled:opacity-50"
            >
              <X size={16} />
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-3 flex items-start justify-between gap-3">
            <h2 className="min-w-0 break-words text-lg font-semibold text-[#2D4030]">
              {title}
            </h2>

            <div className="flex shrink-0 gap-1">
              <button
                type="button"
                onClick={() => {
                  setNewTitle(title);
                  setNewTopic(topic);
                  setFormError("");
                  setIsEditing(true);
                  setShowDeleteConfirmation(false);
                }}
                disabled={isDeleting || isUpdating}
                aria-label="Edit material"
                className="rounded-lg p-2 text-[#2D4030] hover:bg-[#E8DED3] disabled:opacity-50"
              >
                <Pencil size={18} />
              </button>

              <button
                type="button"
                onClick={() => setShowDeleteConfirmation(true)}
                disabled={isDeleting || isUpdating}
                aria-label="Delete material"
                className="rounded-lg p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>

          <div className="mb-3">
            <span className="inline-block max-w-full break-words rounded-full bg-[#A3B19B]/30 px-3 py-1 text-xs font-medium text-[#2D4030]">
              {topic}
            </span>
          </div>

          {description && (
            <p className="mb-4 whitespace-pre-wrap break-words text-sm leading-6 text-gray-600">
              {description}
            </p>
          )}

          <div className="mt-auto flex flex-col gap-4 pt-4">

            {/* Material access button or preview */}
            {((type === "pdf" && fileUrl) ||
              (type === "url" && externalUrl)) && (
              <div>
                {type === "pdf" && fileUrl && (
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-[#A3B19B] px-4 py-2 text-sm font-medium text-[#2D4030] transition-colors hover:bg-[#8F9F87]"
                  >
                    Open PDF
                  </a>
                )}

                {type === "url" && externalUrl && (
                  <a
                    href={externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-[#A3B19B] px-4 py-2 text-sm font-medium text-[#2D4030] transition-colors hover:bg-[#8F9F87]"
                  >
                    {isYoutubeVideo ? "Watch Video" : "Read Article"}
                  </a>
                )}
              </div>
            )}

            {type === "video" && fileUrl && (
              <video
                src={fileUrl}
                controls
                className="w-full rounded-lg"
              />
            )}

            {type === "audio" && fileUrl && (
              <audio src={fileUrl} controls className="w-full" />
            )}

            {type === "image" && fileUrl && (
              <img
                src={fileUrl}
                alt={title}
                className="max-h-56 w-full rounded-lg object-contain"
              />
            )}

            {!hasExtractedText && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs leading-5 text-red-700">
                {isYoutubeVideo
                  ? "English transcript unavailable. You can watch the video."
                  : "Text extraction unavailable. Quiz and flashcard generation is disabled."}
              </p>
            )}
            {/* Study action buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onGenerateQuiz}
                disabled={!hasExtractedText}
                title={!hasExtractedText ? "No extracted text available" : "Generate quiz"}
                className="min-h-11 w-full rounded-lg bg-[#2D4030] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[#405943] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Generate Quiz
              </button>

              <button
                type="button"
                onClick={onGenerateFlashcards}
                disabled={!hasExtractedText}
                title={!hasExtractedText ? "No extracted text available" : "Generate flashcards"}
                className="min-h-11 w-full rounded-lg bg-[#2D4030] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[#405943] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Generate Flashcards
              </button>
            </div>
          </div>
        </>
      )}

      {showDeleteConfirmation && (
        <div className="absolute inset-0 z-20 flex items-center justify-center rounded-xl bg-[#FDF3EC]/95 p-4">
          <div className="w-full rounded-xl border border-[#E8DED3] bg-white p-4 shadow-lg">
            <h3 className="font-semibold text-[#2D4030]">
              Are you sure?
            </h3>

            <p className="mt-2 break-words text-sm text-gray-600">
              Delete "{title}"? This action cannot be undone.
            </p>

            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirmation(false)}
                disabled={isDeleting}
                className="rounded-lg border border-[#E8DED3] px-3 py-2 text-sm text-[#2D4030] hover:bg-[#FDF3EC] disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => void handleConfirmDelete()}
                disabled={isDeleting || isUpdating}
                className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
