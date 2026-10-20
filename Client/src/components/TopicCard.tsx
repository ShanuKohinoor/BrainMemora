
// interface TopicCardProps{
//     title:string;
//     description?:string;
//     progress: number;
// }

// export function TopicCard({title,description,progress}:TopicCardProps){
//     return(
//       <div>
//          <h3>{title}</h3>
//          {description && <p>{description}</p>}
//          <span>{progress}%</span>
//       </div>
//     )
// }

interface TopicCardProps {
  title: string;
  description?: string;
  progress: number;
  onOpenMaterials: () => void;
}

export function TopicCard({
  title,
  description,
  progress,
  onOpenMaterials,
}: TopicCardProps) {
  const safeProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className="rounded-xl border border-[#E8DED3] bg-[#FDF3EC] p-4 shadow-sm">
      <h3 className="text-center text-xl font-semibold text-[#2D4030]">
        {title}
      </h3>

      {description && (
        <p className="mt-2 min-h-10 text-center text-sm text-gray-600">
          {description}
        </p>
      )}

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

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onOpenMaterials}
          className="rounded-lg bg-[#2D4030] px-3 py-2 text-sm font-medium text-white hover:bg-[#405943]"
        >
          Open Materials
        </button>

        <button
          type="button"
          disabled
          className="cursor-not-allowed rounded-lg bg-[#E8E5DF] px-3 py-2 text-sm text-gray-500"
        >
          Generate Flashcards
        </button>

        <button
          type="button"
          disabled
          className="cursor-not-allowed rounded-lg bg-[#E8E5DF] px-3 py-2 text-sm text-gray-500"
        >
          Take Quiz
        </button>
      </div>
    </div>
  );
}
