// Import the flashcard generator from the compiled JavaScript.
import { flashcardGenerator } from "./dist/utils/flashcardGenerator.js";

// Sample text that represents a note.
// const content =
//   "React is a JavaScript library. " +
//   "React uses components to build user interfaces. " +
//   "React has reusable components.";// Generate flashcards from the sample text.
// const result = flashcardGenerator(content);
// Display the generated flashcards.
// console.log(result);

// const testContent =
//   "React IS a JavaScript library. Node useS JavaScript!\nComponents are reusable.And it hAs";


const result = flashcardGenerator(`
JavaScript is a programming language.
React is a JavaScript library.
Components are reusable.
Node.js uses JavaScript.
React has components.
React was created by Facebook.
Components were introduced in React.
React will be used for building user interfaces.
React can build interactive user interfaces.
Developers should write clean code.
React could improve performance.
React would simplify development.
Developers do write code.
React does support reusable components.
JavaScript did introduce new features.
Developers must follow coding standards.
React may improve application performance.

`);

console.log(result);
