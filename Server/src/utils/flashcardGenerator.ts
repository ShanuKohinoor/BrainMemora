
import type { FlashcardBody } from "../types/flashcard.types.js";




// Add a flashcard if it is not already present
   function addUniqueFlashcard(
    flashcards:Pick<FlashcardBody,"question" | "answer">[],
    question:string,
    answer:string
   ){

  // Remove extra spaces from the answer
      let formattedAnswer = answer.trim().replace(/[.!?]+$/, "");

  // Capitalize the first character
      formattedAnswer = formattedAnswer.charAt(0).toUpperCase() + formattedAnswer.slice(1)

  // Add a full stop at the end of the answer
      formattedAnswer += ".";

     const isDuplicate = flashcards.some((card)=>card.question === question && card.answer === formattedAnswer)
    
     // Add the card only when it is not duplicated
      if(!isDuplicate){
        flashcards.push({question,answer:formattedAnswer})
      }
    }

// Generate flashcards from the text of a note.
export function flashcardGenerator(content: string) {
  // Split the note into sentences and remove extra spaces.
  const sentences = content
     .split(/[.!?]+(?:\s+|$)|\r?\n+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 0);

  // Display the sentences for testing
  console.log("Sentences:", sentences);

  // Store the generated flashcards
  const flashcards: Pick<FlashcardBody, "question" | "answer">[] = [];

  // Check each sentence.
  for (const sentence of sentences) {
    // Rule 1: Recognize sentences containing 'is' 
    const parts = sentence.split(/\s+is\s+/i);

    if (parts.length === 2) {
      const term = parts[0]?.trim();
      const definition = parts[1]?.trim().replace(/[.!?]+$/, "");

      // Skip sentences with missing information
      if (!term || !definition) {
        continue;
      }

      // Create a question and its answer
      const question = `What is ${term}?`;
      const answer = definition;

      // Check duplicate and add the flashcard to the array
      addUniqueFlashcard(flashcards, question, answer );
    }



    // Rule 2: Recognize sentences containing 'are'.

    const areParts = sentence.split(/\s+are\s+/i)

    if(areParts.length === 2){
      const term = areParts[0]?.trim();
      const definition = areParts[1]?.trim()
      if(!term || !definition){
        continue
      }

      const question = `What are ${term}?`
      const answer = definition

      addUniqueFlashcard(flashcards,question,answer)
    }



    // Rule 3: Recognize sentences containing 'uses'.
    const usesParts = sentence.split(/\s+uses\s+/i);

    if (usesParts.length === 2) {
      const subject = usesParts[0]?.trim();
      const information = usesParts[1]?.trim().replace(/[.!?]+$/, "");

      // Skip sentences with missing information.
      if (!subject || !information) {
        continue;
      }

      // Create a question and its answer
      const question = `What does ${subject} use?`;
      const answer = information;

      // Check duplicate and add the flashcard to the array
      addUniqueFlashcard(flashcards, question, answer );
    }

    // Rule 4: Recognize sentences containing 'has'
    const hasParts = sentence.split(/\s+has\s+/i);

    if (hasParts.length === 2) {
      const subject = hasParts[0]?.trim();
      const information = hasParts[1]?.trim().replace(/[.!?]+$/, "");

      // Skip sentences with missing information.
      if (!subject || !information) {
        continue;
      }

      // Create a question and its answer.
      const question = `What does ${subject} have?`;
      const answer = information;

      // Check duplicate and add the flashcard to the array
      addUniqueFlashcard(flashcards, question, answer );
    }



          // Rule 5: Recognize sentences containing 'was'.

    const wasParts = sentence.split(/\s+was\s+/i)

    if(wasParts.length === 2){
      const term = wasParts[0]?.trim();
      const definition = wasParts[1]?.trim()
      if(!term || !definition){
        continue
      }

      const question = `What was ${term}?`
      const answer = definition

      addUniqueFlashcard(flashcards,question,answer)
    }



    // Rule 6: Recognize sentences containing 'were'.

    const wereParts = sentence.split(/\s+were\s+/i)

    if(wereParts.length === 2){
      const term = wereParts[0]?.trim();
      const definition = wereParts[1]?.trim()
      if(!term || !definition){
        continue
      }

      const question = `What were ${term}?`
      const answer = definition

      addUniqueFlashcard(flashcards,question,answer)
    }


  
      // Rule 7: Recognize sentences containing 'will be'.

    const willbeParts = sentence.split(/\s+will be\s+/i)

    if(willbeParts.length === 2){
      const term = willbeParts[0]?.trim();
      const definition = willbeParts[1]?.trim()
      if(!term || !definition){
        continue
      }

      const question = `What will ${term} be?`
      const answer = definition

      addUniqueFlashcard(flashcards,question,answer)
    }




    // Rule 8: Recognize sentences containing 'can'.

    const canParts = sentence.split(/\s+can\s+/i)

    if(canParts.length === 2){
      const term = canParts[0]?.trim();
      const definition = canParts[1]?.trim()
      if(!term || !definition){
        continue
      }

      const question = `What can ${term} do?`
      const answer = definition

      addUniqueFlashcard(flashcards,question,answer)
    }




    // Rule 9: Recognize sentences containing 'should'.

    const shouldParts = sentence.split(/\s+should\s+/i)

    if(shouldParts.length === 2){
      const term = shouldParts[0]?.trim();
      const definition = shouldParts[1]?.trim()
      if(!term || !definition){
        continue
      }

      const question = `What should ${term} do?`
      const answer = definition

      addUniqueFlashcard(flashcards,question,answer)
    }





      // Rule 10: Recognize sentences containing 'could'.

    const couldParts = sentence.split(/\s+could\s+/i)

    if(couldParts.length === 2){
      const term = couldParts[0]?.trim();
      const definition = couldParts[1]?.trim()
      if(!term || !definition){
        continue
      }

      const question = `What could ${term} do?`
      const answer = definition

      addUniqueFlashcard(flashcards,question,answer)
    }



    // Rule 11: Recognize sentences containing 'would'.
    const wouldParts = sentence.split(/\s+would\s+/i)

    if(wouldParts.length === 2){
      const term = wouldParts[0]?.trim();
      const definition = wouldParts[1]?.trim()
      if(!term || !definition){
        continue
      }

      const question = `What would ${term} do?`
      const answer = definition

      addUniqueFlashcard(flashcards,question,answer)
    }


      // Rule 12: Recognize sentences containing 'do'.
    const doParts = sentence.split(/\s+do\s+/i)

    if(doParts.length === 2){
      const term = doParts[0]?.trim();
      const definition = doParts[1]?.trim()
      if(!term || !definition){
        continue
      }

      const question = `What do ${term} do?`
      const answer = definition

      addUniqueFlashcard(flashcards,question,answer)
    }



    // Rule 13: Recognize sentences containing 'does'.
    const doesParts = sentence.split(/\s+does\s+/i)

    if(doesParts.length === 2){
      const term = doesParts[0]?.trim();
      const definition = doesParts[1]?.trim()
      if(!term || !definition){
        continue
      }

      const question = `What does ${term} do?`
      const answer = definition

      addUniqueFlashcard(flashcards,question,answer)
    }



      // Rule 14: Recognize sentences containing 'did'.
    const didParts = sentence.split(/\s+did\s+/i)

    if(didParts.length === 2){
      const term = didParts[0]?.trim();
      const definition = didParts[1]?.trim()
      if(!term || !definition){
        continue
      }

      const question = `What did ${term} do?`
      const answer = definition

      addUniqueFlashcard(flashcards,question,answer)
    }



    // Rule 15: Recognize sentences containing 'must'.
    const mustdParts = sentence.split(/\s+must\s+/i)

    if(mustdParts.length === 2){
      const term = mustdParts[0]?.trim();
      const definition = mustdParts[1]?.trim()
      if(!term || !definition){
        continue
      }

      const question = `What must ${term} do?`
      const answer = definition

      addUniqueFlashcard(flashcards,question,answer)
    }




    // Rule 16: Recognize sentences containing 'may'.
    const mayParts = sentence.split(/\s+may\s+/i)

    if(mayParts.length === 2){
      const term = mayParts[0]?.trim();
      const definition = mayParts[1]?.trim()
      if(!term || !definition){
        continue
      }

      const question = `What may ${term} do?`
      const answer = definition

      addUniqueFlashcard(flashcards,question,answer)
    }

  }


  // Return all generated flashcards.
  return flashcards;
}
