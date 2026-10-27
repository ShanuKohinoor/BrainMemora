import { createMaterial, uploadMaterialFile } from "../services/learningMaterialService";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { useNavigate } from "react-router";
import { useState } from "react";
import type{ MaterialType } from "../types/learningMaterial.types";
import { DashboardLayout } from "../components/DashboardLayout";



type TabType = "upload" | "url";


export default function AddMaterial(){
    const navigate = useNavigate()

    const [topic,setTopic] = useState("")
    const [title,setTitle] = useState("")
    const [description,setDescription] = useState("")
    const [type,setType] = useState<MaterialType | "">("")

    const [activeTab,setActiveTab] = useState<TabType>("upload")
    const [file,setFile] = useState<File | null>(null)         //File:-the TypeScript type representing a browser file, such as a PDF or image.
    const [externalUrl,setExternalUrl] = useState("")


    const [error,setError] = useState("")
    const [success,setSuccess] = useState("")


const handleSubmit: React.ComponentProps<"form">["onSubmit"] = async (e) => {
    // Prevent browser from refreshing the page
    e.preventDefault();

    // Clear messages from the previous submission
    setError("");
    setSuccess("");

    // A material type must be selected
    if (!type) {
        setError("Please select a material type");
        return;
    }

    // The Upload File tab requires a selected file
    if (activeTab === "upload" && !file) {
        setError("Please select a file to upload");
        return;
    }

    // The URL Link tab requires a URL
    if (activeTab === "url" && !externalUrl.trim()) {
        setError("Please enter a URL");
        return;
    }

    try {
        // Hold the uploaded file details
        let fileUrl: string | undefined;
        let fileKey: string | undefined;

        // Upload the file only when the Upload File tab is active.
        if (activeTab === "upload" && file) {
            const uploadedFile = await uploadMaterialFile(file);

            // Keep the S3 URL and key for the MongoDB record.
            fileUrl = uploadedFile.fileUrl;
            fileKey = uploadedFile.fileKey;
        }

        // Save the material details after the file upload succeeds.
        const response = await createMaterial({
            title,
            topic,
            description,
            type,
            ...(fileUrl && { fileUrl }),
            ...(fileKey && { fileKey }),
            ...(activeTab === "url" && { externalUrl: externalUrl.trim() })
        });

        // Temporarily check what the backend returns.
        console.log("Create material response:", response);


        // Display the backend success message.
        setSuccess(response.message);

        // Clear the selected file after save.
        setFile(null);
    } catch (error: any) {
        // Display the backend error
        setError(
            error.response?.data?.message ||
            "Failed to create material. Please try again."
        );
    }
}
    return(
        <>
        <DashboardLayout backLabel="Back to Library" backTo="/allLearningMaterials">

        <form onSubmit={handleSubmit}
          className="w-full rounded-2xl bg-white p-5 shadow-sm md:p-8"
        >
         <div className="grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,1fr)_200px]">
            <div>

            <Input
              label="Topic Heading"
              type="text"
              placeholder="Search or enter a topic"
              value={topic}
              onChange={setTopic}
            />
            <Input
              label="Title"
              type="text"
              placeholder="Enter a title"
              value={title}
              onChange={setTitle}
            />

            <Input
              label="Description"
              type="text"
              placeholder="Enter description"
              value={description}
              onChange={setDescription}
            />
         </div>

            <div>
                <label className="text-sm font-semibold text-[#2D4030]">
                    Material Type
                </label>
            <select
              value={type}
              onChange={(e)=>setType(e.target.value as MaterialType | "")}
              required
              className="mt-2 w-full rounded-xl border border-[#D7C8BB] bg-white px-2 py-2"
            >
                <option value="">Select material type</option>
                <option value="article">Article</option>
                <option value="notes">Notes</option>
                <option value="pdf">PDF</option>
                <option value="audio">Audio</option>
                <option value="video">Video</option>
                <option value="image">Image</option>
                <option value="url">URL</option>


            </select>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-green-700">{success}</p>}

     </div>
     <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,1fr)_250px]">
         <div>
            {/* Switching Tabs */}
            <div className="mb-4 flex border-b border-[#D7C8BB]">
                <button
                    type="button"
                    onClick={() => setActiveTab("upload")}
                    className={`flex-1 border-b-2 px-4 py-3 text-sm font-semibold ${
                        activeTab === "upload"
                            ? "border-[#2D4030] text-[#2D4030]"
                            : "border-transparent text-[#2D4030]/60"
                    }`}
                >
                    Upload File
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab("url")}
                    className={`flex-1 border-b-2 px-4 py-3 text-sm font-semibold ${
                        activeTab === "url"
                            ? "border-[#2D4030] text-[#2D4030]"
                            : "border-transparent text-[#2D4030]/60"
                    }`}
                >
                    URL Link
                </button>
            </div>
           
            {/* Upload Files */}
            {activeTab === "upload" && (

            <div className="mt-6 flex flex-col text-center rounded-xl border-2 border-dashed border-[#D7C8BB] bg-[#FDF9F5] p-8 text-center">
                <p className="text-sm text-[#2D4030]">
                    Drag & drop your file here or click to browse
                </p>
                <p className="mt-2 text-xs text-gray-500">
                Supported: PDF, DOCX, MP4, MP3, PNG, JPG
                </p>
                <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.mp3,.wav,.ogg,.webm,.m4a,.mp4,.mov,.doc,.docx"
                onChange={(e)=>{
                    setFile(e.target.files?.[0] ?? null)
                }}
                className="mt-4 block w-full text-sm"
                />
                {file && (
                    <p className="mt-3 w-full max-w-xs text-sm text-[#2D4030]">
                    Selected file: {file.name}
                    </p>
                )}
            </div>
          )}
          {/* URL Link */}
          {activeTab === "url" &&(
            <div>
                <Input
                  label="Paste URL"
                  value={externalUrl}
                  type="url"
                  placeholder="Place a link here"
                  onChange={setExternalUrl}
                />
            </div>
          )}

          </div>


          <div className="flex w-full flex items-end justify-center gap-4 pt-8">
                <Button
                type="button"
                label="Cancel"
                onClick={() => navigate("/allLearningMaterials")}
            />

            <Button
                type="submit"
                label="Save & Process"
            />
            </div>

         </div>

        </form>
       </DashboardLayout>

        </>

    )
}