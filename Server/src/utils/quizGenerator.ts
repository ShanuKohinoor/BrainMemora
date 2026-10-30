
import type { QuizQuestion } from "../types/quiz.types.js";

// Generate quiz questions from learning material
export function quizGenerator(content: string): QuizQuestion[] {
  const sentences = content
    .split(/[.!?]+(?:\s+|$)|\r?\n+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 0);

  const questions: QuizQuestion[] = [];

  // Store subjects and their descriptions
  const definitions: {
    subject: string;
    verb: string;
    description: string;
  }[] = [];

  // Extract definitions from sentences
  for (const sentence of sentences) {

    // Skip sentences that are already questions
    if (/^(what|who|where|when|why|how)\b/i.test(sentence)) {
      continue;
    }

    // Skip sentences that begin with unclear pronouns
    if (/^(it|this|that|these|those|they|he|she|we|you|i|there)\b/i.test(sentence)) {
      continue;
    }

    const match = sentence.match(/^(.+?)\s+(is|are)\s+(.+)$/i);

    if (!match || !match[1] || !match[2] || !match[3]) {
      continue;
    }

    const subject = match[1].trim();
    const verb = match[2].toLowerCase();
    const description = match[3].trim().replace(/[.!?]+$/, "");

    if (!subject || !description) {
      continue;
    }

    definitions.push({
      subject,
      verb,
      description,
    });
  }

  // Generate quiz questions from the extracted definitions
  for (const item of definitions) {
    const { subject, verb, description } = item;

    // Find other descriptions to use as wrong answers
    const otherDescriptions: string[] = [];

    for (const otherItem of definitions) {
      if (
        otherItem.subject.toLowerCase() !== subject.toLowerCase() &&
        otherItem.description.toLowerCase() !== description.toLowerCase()
      ) {
        otherDescriptions.push(otherItem.description);
      }
    }

    // Remove duplicate answers
    const uniqueDescriptions = [...new Set(otherDescriptions)];

    // We need three wrong answers
    if (uniqueDescriptions.length < 3) {
      continue;
    }

    // Keep articles such as 'a' and 'the' in lowercase in the question
    const questionSubject = /^(a|an|the)\s/i.test(subject)
      ? subject.charAt(0).toLowerCase() + subject.slice(1)
      : subject;

    const question = `What ${verb} ${questionSubject}?`;

    // Create four options using the correct answer and wrong answers
    const options = [
      description,
      ...uniqueDescriptions.slice(0, 3),
    ].sort(() => Math.random() - 0.5);

    questions.push({
      question,
      options,
      correctAnswer: description,
    });
  }

  return questions;
}
