import { fetchTranscript } from "youtube-transcript"


// Retrieve  English captions of a YouTube video
export const getYouTubeTranscript = async(url:string):Promise<string | undefined>=>{
    try{

        // Fetch the available English captions using YouTube URL
        const transcript = await fetchTranscript(url,{
            lang: "en"
        })

        // Combine all caption texts into one continuous transcript
        const transcriptText = transcript.map((caption)=>caption.text).join(" ")

        // Return the transcript if available
        return transcriptText.trim() || undefined
         
        }catch{
        // Return undefined if captions are unavailable
        return undefined;
    }

}

