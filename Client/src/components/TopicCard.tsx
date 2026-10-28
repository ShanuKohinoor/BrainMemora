
import { useState } from "react";
import { MoreVertical, Pencil, Trash2, Check, X } from "lucide-react";

interface TopicCardProps {
  title: string;
  description?: string;
  progress: number;
  color: string;                 // Background color for topic card
  onOpenMaterials: () => void;
  onGenerateFlashcards:()=>void;
  onGenerateQuiz:()=>void;
  onEdit: (newTitle: string) => Promise<boolean>;
  onDelete: () => Promise<void> | void;
  isEditing: boolean;
  isDeleting: boolean;
}

export function TopicCard({
  title,
  description,
  progress,
  color,
  onOpenMaterials,
  onGenerateFlashcards,
  onGenerateQuiz,
  onEdit,
  onDelete,
  isEditing,
  isDeleting,
}: TopicCardProps) {
  // Store whether the three dot menu is open.
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Keep progress between 0 and 100.
  const safeProgress = Math.min(100, Math.max(0, progress));

  // Store whether the topic title is edited
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  // Store the new topic title while editing
  const [newTitle, setNewTitle] = useState(title);

  // Store whether the delete confirmation is visible
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  // Save the new topic title 
  const handleSave = async () => {
    if (!newTitle.trim()) {
      return;
    }

    if (newTitle.trim() === title) {
      setIsEditingTitle(false);
      return;
    }

    const success = await onEdit(newTitle.trim());

    if (success) {
      setIsEditingTitle(false);
    }
  };

  // Cancel editing and restore the original topic title.
  const handleCancelEdit = () => {
    setNewTitle(title);
    setIsEditingTitle(false);
  };

  // Confirm deletion and call the parent delete handler.
  const handleConfirmDelete = async () => {
    await onDelete();
    setShowDeleteConfirmation(false);
  };

  return (
    <div className="relative rounded-xl border border-[#E8DED3] bg-[#FDF3EC] p-4 shadow-sm"
          style={{backgroundColor:color}}>

      {/* Three dot menu button */}
      <button
        type="button"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label={`Options for ${title}`}
        aria-expanded={isMenuOpen}
        disabled={isEditing || isDeleting || isEditingTitle}
        className="absolute right-3 top-3 rounded-lg p-1 text-[#2D4030] hover:bg-[#E8DED3] disabled:opacity-50"
      >
        <MoreVertical size={20} />
      </button>

      {/* Edit and Delete options appear only when the menu is open */}
      {isMenuOpen && (
        <div className="absolute right-3 top-10 z-10 w-36 overflow-hidden rounded-lg border border-[#E8DED3] bg-white shadow-lg">
          <button
            type="button"
            onClick={() => {
              setIsMenuOpen(false);
              setNewTitle(title);
              setIsEditingTitle(true);
              setShowDeleteConfirmation(false);
            }}
            disabled={isEditing || isDeleting}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[#2D4030] hover:bg-[#FDF3EC] disabled:opacity-50"
          >
            <Pencil size={16} />
            Edit
          </button>

          <button
            type="button"
            onClick={() => {
              setIsMenuOpen(false);
              setShowDeleteConfirmation(true);
              setIsEditingTitle(false);
            }}
            disabled={isEditing || isDeleting}
            className="flex w-full items-center gap-2 border-t border-[#E8DED3] px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      )}

      {/* Topic title */}
      {isEditingTitle ? (
        <div className="pr-7">
          <input
            type="text"
            value={newTitle}
            onChange={(event) => setNewTitle(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                void handleSave();
              }

              if (event.key === "Escape") {
                handleCancelEdit();
              }
            }}
            aria-label="Edit topic name"
            autoFocus
            className="w-full rounded-lg border border-[#A3B19B] bg-white px-3 py-2 text-center text-lg font-semibold text-[#2D4030] outline-none focus:ring-2 focus:ring-[#A3B19B]"
          />

          <div className="mt-2 flex justify-center gap-2">
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={isEditing || isDeleting || !newTitle.trim()}
              className="flex items-center gap-1 rounded-lg bg-[#2D4030] px-3 py-2 text-sm font-medium text-white hover:bg-[#405943] disabled:opacity-50"
            >
              <Check size={16} />
              {isEditing ? "Saving..." : "Save"}
            </button>

            <button
              type="button"
              onClick={handleCancelEdit}
              disabled={isEditing}
              className="flex items-center gap-1 rounded-lg border border-[#E8DED3] px-3 py-2 text-sm text-[#2D4030] hover:bg-white disabled:opacity-50"
            >
              <X size={16} />
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <h3 className="px-6 text-center text-xl font-semibold text-[#2D4030]">
          {title}
        </h3>
      )}

      {/* Optional topic description */}
      {description && (
        <p className="mt-2 min-h-10 text-center text-sm text-gray-600">
          {description}
        </p>
      )}

      {/* Topic progress bar */}
      <div className="mt-5">
        <div
          className="h-2 w-full overflow-hidden rounded-full bg-gray-200"
          role="progressbar"
          aria-label={`${title} progress`}
          aria-valuenow={safeProgress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-[#A3B19B] transition-all"
            style={{ width: `${safeProgress}%` }}
          />
        </div>

        <p className="mt-2 text-right text-sm font-medium text-[#2D4030]">
          {safeProgress}%
        </p>
      </div>

      {/* Topic action buttons */}
      <div className="mt-3 flex flex-col gap-2">
        <button
          type="button"
          onClick={onOpenMaterials}
          disabled={isEditing || isDeleting || isEditingTitle}
          className="rounded-lg bg-[#2D4030] px-3 py-2 text-sm font-medium text-white hover:bg-[#405943] disabled:opacity-50"
        >
          Open Materials
        </button>
       <div className="flex w-full gap-2">

        <button
          type="button"
          onClick={onGenerateFlashcards}
          disabled={isEditing || isDeleting || isEditingTitle}
          className="min-w-0 flex-1 rounded-lg bg-[#B85F45] px-2 py-2 text-center text-xs font-medium text-white hover:bg-[#984A35] disabled:opacity-50"        >
          Generate Flashcards
        </button>
        <button
          type="button"
          onClick={onGenerateQuiz}
          disabled={isEditing || isDeleting || isEditingTitle}
          className="min-w-0 flex-1 rounded-lg bg-[#B85F45] px-2 py-2 text-center text-xs font-medium text-white hover:bg-[#984A35] disabled:opacity-50"        >
          Take Quiz
        </button>
      </div>
    </div>

      {/* Delete confirmation appears inside the topic card */}
      {showDeleteConfirmation && (
        <div className="absolute inset-0 z-20 flex items-center justify-center rounded-xl bg-[#FDF3EC]/95 p-4">
          <div className="w-full rounded-xl border border-[#E8DED3] bg-white p-4 shadow-lg">
            <h4 className="font-semibold text-[#2D4030]">
              Are you sure?
            </h4>

            <p className="mt-2 text-sm text-gray-600">
              Delete "{title}" and all learning materials associated with this topic?
            </p>

            <div className="mt-4 flex justify-end gap-2">
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
                disabled={isDeleting || isEditing}
                className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Yes, delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
