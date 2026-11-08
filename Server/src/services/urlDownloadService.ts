
import { DownloadError } from "../utils/error.js";



// Download a file from a URL
export const downloadFromUrl = async(url: string): 
    Promise<{
        buffer: Buffer;
        fileName: string;
        mimetype: string;
    }>=>{

  //  Declares a variable to hold the parsed URL
    let parsedUrl: URL;

    try{
        // Checks whether the URL format is valid
         parsedUrl = new URL(url)
    }catch{
        throw new DownloadError("Please provide a valid URL")
    }

        // Allow  only HTTP and HTTPS only
        if(parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:"){
           throw new DownloadError("Only HTTP and HTTPS URLs are supported");
        }

        // Prevent downloading from localhost
        if (parsedUrl.hostname === "localhost") {
            throw new DownloadError("Local URLs are not allowed");
        }

    // Send request to the external source and get response from there
    let response: Response;

    try {
        response = await fetch(url);
    } catch {
        throw new DownloadError("Unable to connect to the URL. Please check the link and try again");
    }

    // Check whether the download was successful
    if(!response.ok){
        throw new DownloadError("Unable to download the resource. Please check the URL and try again")
    }

        const mimetype = response.headers.get("content-type")?.split(";")[0]?.trim();
        if (!mimetype) {
            throw new DownloadError("Unable to identify the file type");
        }

     const fileName: string = parsedUrl.pathname.split("/").filter(Boolean).slice(-1)[0] ?? "downloaded-file";
    // Check file size (maximum 50 MB)
    const fileSize = Number(response.headers.get("content-length"));

    if (fileSize > 50 * 1024 * 1024) {
        throw new DownloadError("File size exceeds 50 MB");
    }

    // Read the downloaded file data (bytes)
    const arrayBuffer = await response.arrayBuffer();

    if (arrayBuffer.byteLength > 50 * 1024 * 1024) {
        throw new DownloadError("File size exceeds 50 MB");
    }

    // Convert the data into a Node.js Buffer using Buffer.from()
    const fileBuffer = Buffer.from(arrayBuffer);

    // Return downloaded file
    return {
        buffer: fileBuffer,
        fileName,
        mimetype
    };
}
