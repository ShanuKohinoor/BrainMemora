// Allowed types of learning materials
export type MaterialType =
  | "pdf"
  | "video"
  | "audio"
  | "image"
  | "article"
  | "url"

// A saved learning material received from the backend
export interface LearningMaterial {
  _id: string;
  userId: string;
  title: string;
  type: MaterialType;
  description?: string;
  fileUrl?: string;
  fileKey?: string;
  externalUrl?: string;
  topic: string;
  tags?: string[];
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

// Data sent to the backend when creating a learning material
export interface CreateLearningMaterialBody {
  title: string;
  topic: string;
  description?: string;
  type: MaterialType;
  fileUrl?: string;
  fileKey?: string;
  externalUrl?: string;
  tags?: string[];
}
