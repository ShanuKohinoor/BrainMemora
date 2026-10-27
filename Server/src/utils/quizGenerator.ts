import type { QuizQuestion } from "../types/quiz.types.js";

// Generate quiz questions from learning material
export function quizGenerator(content: string): QuizQuestion[] {
  const sentences = content
    .split(/[.!?]+|\n+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 0);

  const questions: QuizQuestion[] = [];

  for (const sentence of sentences) {
    const match = sentence.match(/^(.+?)\s+(is|are)\s+(.+)$/i);

    if (!match || !match[1] || !match[2] || !match[3]) {
      continue;
    }

    const subject = match[1].trim();
    const verb = match[2].toLowerCase();
    const description = match[3].trim();

    // Find other subjects to use as wrong answers
    const otherSubjects: string[] = [];

    for (const item of sentences) {
      const result = item.match(/^(.+?)\s+(?:is|are)\s+(.+)$/i);

      if (result && result[1] && result[1].trim() !== subject) {
        otherSubjects.push(result[1].trim());
      }
    }

    // Remove duplicate answers
    const uniqueSubjects = [...new Set(otherSubjects)];

    // We need three wrong answers
    if (uniqueSubjects.length < 3) continue;

    const options = [subject, ...uniqueSubjects.slice(0, 3)].sort(
      () => Math.random() - 0.5
    );

    questions.push({
      question: `_____ ${verb} ${description}.`,
      options,
      correctAnswer: subject,
    });
  }

  return questions;
}