
import { PDFParse } from "pdf-parse";
import { extractImageText } from "./utils/imageTextExtractor.js";

export async function extractPdfText(
  pdfBuffer: Buffer
): Promise<string> {
  // Create a PDF parser using the uploaded PDF data.
  const parser = new PDFParse({ data: pdfBuffer });

  try {
    // Try extracting selectable text from the PDF first.
    const result = await parser.getText();
    const extractedText = result.text.trim();

    // Check whether the result contains only a page marker.
    const isPageMarker =
      /^--\s*\d+\s+of\s+\d+\s*--$/i.test(extractedText);

    // Return the text if it contains actual content.
    if (extractedText && !isPageMarker) {
      return extractedText;
    }

    // If no useful text was found, render the PDF pages.
    const screenshotResult = await parser.getScreenshot({
      scale: 1.5,
    });

    // Store the OCR result from each page.
    const pageTexts: string[] = [];

    // Read text from each rendered page using OCR.
    for (const page of screenshotResult.pages) {
      const pageText = await extractImageText(
        Buffer.from(page.data)
      );

      if (pageText.trim()) {
        pageTexts.push(pageText.trim());
      }
    }

    // Combine all page text into one string.
    return pageTexts.join("\n\n").trim();
  } finally {
    // Release PDF parser resources.
    await parser.destroy();
  }
}
