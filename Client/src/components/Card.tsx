
import type{ MaterialType } from "../types/learningMaterial.types";

interface CardProps {
  title: string;
  description?: string;
  type?:MaterialType;
  fileUrl?: string;
  externalUrl?:string;
}

export function Card({ title, description,type,fileUrl,externalUrl }: CardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="mb-2 text-xl font-semibold text-gray-800">
        {title}
      </h2>

      <p className="text-gray-600">
        {description}
      </p>
      {type === "pdf" && fileUrl && (
  <a href={fileUrl} target="_blank" rel="noopener noreferrer">
    Open PDF
  </a>
)}

{type === "video" && fileUrl && (
  <video src={fileUrl} controls />
)}

{type === "audio" && fileUrl && (
  <audio src={fileUrl} controls />
)}

{type === "image" && fileUrl && (
  <img src={fileUrl} alt={title} />
)}

{type === "article" && externalUrl && (
  <a href={externalUrl} target="_blank" rel="noopener noreferrer">
    Read Article
  </a>
)}

    </div>
  );
}