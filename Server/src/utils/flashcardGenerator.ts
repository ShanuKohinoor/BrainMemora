
import type { FlashcardBody } from "../types/flashcard.types.js";




// Add a flashcard if it is not already present
   function addUniqueFlashcard(
    flashcards:Pick<FlashcardBody,"question" | "answer">[],
    question:string,
    answer:string
   ){

  // Remove extra spaces from the answer
      let formattedAnswer = answer.trim().replace(/[.!?]+$/, "");

      // Skip empty or excessively long answers
      if (!formattedAnswer || formattedAnswer.length > 300) {
        return;
      }

  // Capitalize the first character
      formattedAnswer = formattedAnswer.charAt(0).toUpperCase() + formattedAnswer.slice(1)

  // Add a full stop at the end of the answer
      formattedAnswer += ".";

     const isDuplicate = flashcards.some(
      (card) =>
        card.question.toLowerCase() === question.toLowerCase() &&
        (card.answer ?? "").toLowerCase() === formattedAnswer.toLowerCase()     )
    
     // Add the card only when it is not duplicated
      if(!isDuplicate){
        flashcards.push({question,answer:formattedAnswer})
      }
    }

// Generate flashcards from the text of a note
export function flashcardGenerator(content: string) {
  // Split the note into sentences and remove extra spaces
  const sentences = content
     .split(/[.!?]+(?:\s+|$)|\r?\n+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 0);

  // Display the sentences for testing
  console.log("Sentences:", sentences);

  // Store the generated flashcards
  const flashcards: Pick<FlashcardBody, "question" | "answer">[] = [];

  // Check each sentence
  for (const sentence of sentences) {
    
        // Skip sentences that are already questions
    if (/^(what|who|where|when|why|how)\b/i.test(sentence)) {
      continue;
    }

    // Skip sentences that begin with unclear pronouns
    if (/^(it|this|that|these|those|they|he|she|we|you|i|there)\b/i.test(sentence)) {
      continue;
    }

    // Rule 1: Recognize sentences containing 'is'
    const isMatch = sentence.match(/^(.+?)\s+is\s+(.+)$/i);

    if (isMatch) {
      const term = isMatch[1]?.trim();
      const definition = isMatch[2]?.trim();

      if (!term || !definition) {
        continue;
      }

      const question = `What is ${term}?`;
      const answer = definition;

      addUniqueFlashcard(flashcards, question, answer);
      continue;
    }



    // Rule 2: Recognize sentences containing 'are'
    const areMatch = sentence.match(/^(.+?)\s+are\s+(.+)$/i);

    if (areMatch) {
      const term = areMatch[1]?.trim();
      const definition = areMatch[2]?.trim();

      if (!term || !definition) {
        continue;
      }

      const question = `What are ${term}?`;
      const answer = definition;

      addUniqueFlashcard(flashcards, question, answer);
      continue;
    }



    // Rule 3: Recognize sentences containing 'uses'
    const usesMatch = sentence.match(/^(.+?)\s+uses\s+(.+)$/i);

    if (usesMatch) {
      const subject = usesMatch[1]?.trim();
      const information = usesMatch[2]?.trim();

      if (!subject || !information) {
        continue;
      }

      const question = `What does ${subject} use?`;
      const answer = information;

      addUniqueFlashcard(flashcards, question, answer);
      continue;
    }

    // Rule 4: Recognize sentences containing 'has'
    const hasMatch = sentence.match(/^(.+?)\s+has\s+(.+)$/i);

    if (hasMatch) {
      const subject = hasMatch[1]?.trim();
      const information = hasMatch[2]?.trim();

      if (!subject || !information) {
        continue;
      }

      const question = `What does ${subject} have?`;
      const answer = information;

      addUniqueFlashcard(flashcards, question, answer);
      continue;
    }



    // Rule 5: Recognize sentences containing 'was'
    const wasMatch = sentence.match(/^(.+?)\s+was\s+(.+)$/i);

    if (wasMatch) {
      const term = wasMatch[1]?.trim();
      const definition = wasMatch[2]?.trim();

      if (!term || !definition) {
        continue;
      }

      const question = `What was ${term}?`;
      const answer = definition;

      addUniqueFlashcard(flashcards, question, answer);
      continue;
    }



    // Rule 6: Recognize sentences containing 'were'
    const wereMatch = sentence.match(/^(.+?)\s+were\s+(.+)$/i);

    if (wereMatch) {
      const term = wereMatch[1]?.trim();
      const definition = wereMatch[2]?.trim();

      if (!term || !definition) {
        continue;
      }

      const question = `What were ${term}?`;
      const answer = definition;

      addUniqueFlashcard(flashcards, question, answer);
      continue;
    }


  
    // Rule 7: Recognize sentences containing 'will be'
    const willbeMatch = sentence.match(/^(.+?)\s+will be\s+(.+)$/i);

    if (willbeMatch) {
      const term = willbeMatch[1]?.trim();
      const definition = willbeMatch[2]?.trim();

      if (!term || !definition) {
        continue;
      }

      const question = `What will ${term} be?`;
      const answer = definition;

      addUniqueFlashcard(flashcards, question, answer);
      continue;
    }



    // Rule 8: Recognize sentences containing 'can'
    const canMatch = sentence.match(/^(.+?)\s+can\s+(.+)$/i);

    if (canMatch) {
      const term = canMatch[1]?.trim();
      const definition = canMatch[2]?.trim();

      if (!term || !definition) {
        continue;
      }

      const question = `What can ${term} do?`;
      const answer = definition;

      addUniqueFlashcard(flashcards, question, answer);
      continue;
    }



    // Rule 9: Recognize sentences containing 'should'
    const shouldMatch = sentence.match(/^(.+?)\s+should\s+(.+)$/i);

    if (shouldMatch) {
      const term = shouldMatch[1]?.trim();
      const definition = shouldMatch[2]?.trim();

      if (!term || !definition) {
        continue;
      }

      const question = `What should ${term} do?`;
      const answer = definition;

      addUniqueFlashcard(flashcards, question, answer);
      continue;
    }



    // Rule 10: Recognize sentences containing 'could'
    const couldMatch = sentence.match(/^(.+?)\s+could\s+(.+)$/i);

    if (couldMatch) {
      const term = couldMatch[1]?.trim();
      const definition = couldMatch[2]?.trim();

      if (!term || !definition) {
        continue;
      }

      const question = `What could ${term} do?`;
      const answer = definition;

      addUniqueFlashcard(flashcards, question, answer);
      continue;
    }



    // Rule 11: Recognize sentences containing 'would'
    const wouldMatch = sentence.match(/^(.+?)\s+would\s+(.+)$/i);

    if (wouldMatch) {
      const term = wouldMatch[1]?.trim();
      const definition = wouldMatch[2]?.trim();

      if (!term || !definition) {
        continue;
      }

      const question = `What would ${term} do?`;
      const answer = definition;

      addUniqueFlashcard(flashcards, question, answer);
      continue;
    }


    // Rule 12: Recognize sentences containing 'do'
    const doMatch = sentence.match(/^(.+?)\s+do\s+(.+)$/i);

    if (doMatch) {
      const term = doMatch[1]?.trim();
      const definition = doMatch[2]?.trim();

      if (!term || !definition) {
        continue;
      }

      const question = `What do ${term} do?`;
      const answer = definition;

      addUniqueFlashcard(flashcards, question, answer);
      continue;
    }



    // Rule 13: Recognize sentences containing 'does'
    const doesMatch = sentence.match(/^(.+?)\s+does\s+(.+)$/i);

    if (doesMatch) {
      const term = doesMatch[1]?.trim();
      const definition = doesMatch[2]?.trim();

      if (!term || !definition) {
        continue;
      }

      const question = `What does ${term} do?`;
      const answer = definition;

      addUniqueFlashcard(flashcards, question, answer);
      continue;
    }



    // Rule 14: Recognize sentences containing 'did'
    const didMatch = sentence.match(/^(.+?)\s+did\s+(.+)$/i);

    if (didMatch) {
      const term = didMatch[1]?.trim();
      const definition = didMatch[2]?.trim();

      if (!term || !definition) {
        continue;
      }

      const question = `What did ${term} do?`;
      const answer = definition;

      addUniqueFlashcard(flashcards, question, answer);
      continue;
    }



    // Rule 15: Recognize sentences containing 'must'
    const mustMatch = sentence.match(/^(.+?)\s+must\s+(.+)$/i);

    if (mustMatch) {
      const term = mustMatch[1]?.trim();
      const definition = mustMatch[2]?.trim();

      if (!term || !definition) {
        continue;
      }

      const question = `What must ${term} do?`;
      const answer = definition;

      addUniqueFlashcard(flashcards, question, answer);
      continue;
    }




    // Rule 16: Recognize sentences containing 'may'
    const mayMatch = sentence.match(/^(.+?)\s+may\s+(.+)$/i);

    if (mayMatch) {
      const term = mayMatch[1]?.trim();
      const definition = mayMatch[2]?.trim();

      if (!term || !definition) {
        continue;
      }

      const question = `What may ${term} do?`;
      const answer = definition;

      addUniqueFlashcard(flashcards, question, answer);
      continue;
    }

  }


  // Return all generated flashcards
  return flashcards;
}
