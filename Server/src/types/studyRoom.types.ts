export interface StudyRoom {
    _id: string;                     // Unique ID of the study room
    name: string;                    // Name of the room
    description?: string;            // Description of the room
    ownerId: string;                 // User ID of the room creator

    members: string[];               // IDs of all users who belong to the room
    inviteCode: string;              // Unique code used to join the room

    sharedMaterials: string[];       // IDs of learning materials shared in the room
    sharedQuizzes: string[];         // IDs of quizzes shared in the room
    sharedFlashcards: string[];      // IDs of flashcard sets shared in the room
    sharedLearningSessions: string[]; // IDs of learning sessions shared in the room

    createdAt: Date;                 // Date when the room was created
    updatedAt: Date;                 // Date when the room was last updated
}