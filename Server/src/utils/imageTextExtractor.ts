import { createWorker } from "tesseract.js";


//Extract text from an image

export async function extractImageText(imageBuffer:Buffer):Promise<string>{     // Return extracted text should be in string
    // Create worker for English text
    const worker = await createWorker("eng")

    // Recognize text in the image
    const result = await worker.recognize(imageBuffer)

    // Close the worker after recognition
    await worker.terminate()

    // Return the extracted text without EXTRA whitespace
    return result.data.text.trim()
}