import { createMaterial } from "../services/learningMaterialService";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { useNavigate } from "react-router";
import { useState } from "react";
import type{ MaterialType } from "../types/learningMaterial.types";
import { DashboardLayout } from "../components/DashboardLayout";



type TabType = "upload" | "url" | "notes";


export default function AddMaterial(){
    const navigate = useNavigate()

    const [topic,setTopic] = useState("")
    const [title,setTitle] = useState("")
    const [description,setDescription] = useState("")
    const [type,setType] = useState<MaterialType | "">("")

    const [activeTab,setActiveTab] = useState<TabType>("upload")
    const [file,setFile] = useState<File | null>(null)
    const [externalUrl,setExternalUrl] = useState("")
    const [customNotes,setCustomNotes] = useState("")


    const [error,setError] = useState("")
    const [success,setSuccess] = useState("")


    const handleSubmit: React.ComponentProps<"form">["onSubmit"] = async(e)=>{
        e.preventDefault()
        setError("")
        setSuccess("")

        if(!type){
            setError("Please select a type material")
            return
        }

        try{
          const response = await createMaterial({
                title,
                topic,
                description,
                type
            })
            setSuccess(response.message)
        }catch(error:any){
            setError(
                error.response?.data?.message ||
                "Failed to create material. Please try"
            )
        }
    }

    return(
        <>
        <DashboardLayout>

        <form onSubmit={handleSubmit}
          className="w-90% rounded-2xl bg-white p-5 shadow-sm md:p-8"
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

            </select>
            {/* <Input
              label="Title"
              type="text"
              placeholder="Enter a title"
              value={title}
              onChange={setTitle}
              /> */}
            </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-green-700">{success}</p>}

     </div>
    <div className="grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,1fr)_250px]">

     {/* Upload Files */}
     <div className="mt-6 rounded-xl border-2 border-dashed border-[#D7C8BB] bg-[#FDF9F5] p-8 text-center">
        <input
           type="file"
           accept=".pdf,.png,.jpg,.jpeg,.mp3,.mp4,.doc,.docx"
           onChange={(e)=>{
            setFile(e.target.files?.[0] ?? null)
           }}
           className="mt-4 block w-full text-sm"
         />
         {file && (
            <p className="mt-3 text-sm text-sm text-[#2D4030]">
               Selected file: {file.name}
            </p>
         )}
     </div>
         <div className="mt-12 flex flex-col w-full h-12 justify-end gap-6 items-center text-sm sm:flex-row">

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