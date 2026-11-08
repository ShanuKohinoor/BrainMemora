// const html = buffer.toString("utf-8");   // converts downloaded HTML bytes into readable text.
// const extractedText = extractWebpageText(html, externalUrl); //processes that HTML and extracts the article content.



import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";

// extracts the main article text

export const extractWebpageText = (html: string, url: string): string => {

    // Convert HTML string into a document
    const dom = new JSDOM(html, { url });

    // Pass the document to Readability
    const reader = new Readability(dom.window.document);

    // Extract the main article content
    const article = reader.parse();

    // Check whether any readable text was extracted
    if (!article?.textContent?.trim()) {
        throw new Error("Could not extract readable content from this webpage");
    }

    // Return the extracted text
    return article.textContent.trim();
};