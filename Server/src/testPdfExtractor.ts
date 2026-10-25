// Read the PDF file from the server folder
import { readFile } from "node:fs/promises";

// Import our PDF extractor function
import { extractPdfText } from "./utils/pdfExtractor.js";

// Test the PDF extractor
async function testPdfExtractor() {
    // Read the PDF file
    const pdfBuffer = await readFile("./textpdf.pdf");

    // Extract text from the PDF
    const text = await extractPdfText(pdfBuffer);

    // Display the extracted text
    console.log(text);
}

// Run the test
testPdfExtractor().catch(console.error);