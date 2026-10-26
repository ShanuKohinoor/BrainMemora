// Run FFmpeg on the computer
import { execFile } from "node:child_process";

// Allow us to use await with FFmpeg
import { promisify } from "node:util";

// Create temporary files, save data, read text, and delete files
import { mkdtemp, writeFile, readFile, rm } from "node:fs/promises";

// Get the operating system's temporary folder
import os from "node:os";

// Build file and folder paths
import path from "node:path";




// Convert execFile into a function we can use with await
const runFFmpeg = promisify(execFile);                     // execFile lets Node.js run an external program, such as FFmpeg


// Prepare Windows paths for use inside an FFmpeg filter.
function escapeFFmpegFilterPath(filePath: string): string {
    return filePath
        .replace(/\\/g, "/")   // Convert backslashes to forward slashes.
        .replace(/:/g, "\\:"); // Escape the drive-letter colon.
}





export async function transcribedMedia(fileBuffer: Buffer): Promise<string> {
    // Create a temporary folder for this file(for processing the audio or video)
    const folder = await mkdtemp(path.join(os.tmpdir(), "brainmemora-"));

    // Create a path for the temporary audio or video file
    const input = path.join(folder, "input");

    // Save the uploaded file in the temporary folder
    await writeFile(input, fileBuffer);

    // Create a path where the transcript will be saved
    const output = path.join(folder, "transcript.txt");


    // Find the FFmpeg program on this computer
    const ffmpegPath = path.join(
        process.env.LOCALAPPDATA!,
        "Microsoft",
        "WinGet",
        "Packages",
        "Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe",
        "ffmpeg-9.0.2-full_build",
        "bin",
        "ffmpeg.exe"
    );


    // Find the English Whisper model saved in the server folder
    const modelPath = path.join(
        process.cwd(),
        "models",
        "ggml-base.en.bin"
    );


    // Prepare the file paths for FFmpeg
    const escapedModelPath = escapeFFmpegFilterPath(modelPath);
    const escapedOutputPath = escapeFFmpegFilterPath(output);


    // Run Whisper to convert speech into text
    try {
        await runFFmpeg(ffmpegPath, [
            "-i", input,
            "-af",
            `whisper=model='${escapedModelPath}':destination='${escapedOutputPath}'`,
            "-f", "null", "-"
        ]);

        // Read the transcript saved by Whisper
        const transcript = await readFile(output, "utf8");

        // Return the recognized words
        return transcript.trim();
    } finally {
        // Delete temporary files after processing finishes
        await rm(folder, { recursive: true, force: true });
    }
}