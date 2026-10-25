import { readFile } from "node:fs/promises";
import { extractImageText } from "./utils/imageTextExtractor.js";

// Read the test image into a buffer
const imageBuffer = await readFile("./test-image.png");

// Extract text from the image
const extractedText = await extractImageText(imageBuffer);

// Display the extracted text
console.log(extractedText);