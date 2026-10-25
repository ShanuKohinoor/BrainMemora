// Import the PDF library
import { PDFParse } from "pdf-parse";

import { extractImageText } from "./imageTextExtractor.js";

// Extract text from a PDF
export async function extractPdfText(pdfBuffer: Buffer):Promise<string> {
    // Create a parser using the PDF data
    const parser = new PDFParse({ data: pdfBuffer });

    try{
                           // Extract text from the PDF
        const result = await parser.getText();

        const extractedText = result.text.trim()

    // Check whether the result contains only a page marker.
        const isPageMarker =
        /^--\s*\d+\s+of\s+\d+\s*--$/i.test(extractedText);

        // Return the text if it contains actual content.
        if (extractedText && !isPageMarker) {
        return extractedText;
        }


        console.log("PDF extracted text:", JSON.stringify(extractedText));


                         // Convert pdf pages(non-text) into images
        const screenShotResult = await parser.getScreenshot({scale:1.5})    //getScreenshot() converts the PDF pages into images.             

        // Store the text extracted from each page
         const pageTexts: string[] = [];


         // Read text from each page image
            for (const page of screenShotResult.pages) {
                const pageText = await extractImageText(Buffer.from(page.data));  // Buffer.from(page.data) — converts the page image data into the format OCR function accepts.
                                                                                    // Ask Tesseract to read text in that image
                pageTexts.push(pageText);
            }

            // Combine the text from all pages into one string
              return pageTexts.join("\n\n").trim();            // \n\n:- Leaving blank line between pages
    }finally{
        // Clean up the parser
        await parser.destroy();
    }
}