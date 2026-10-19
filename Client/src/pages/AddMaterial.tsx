import { createMaterial } from "../services/learningMaterialService";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { useNavigate } from "react-router";
import { useState } from "react";
import type{ MaterialType } from "../types/learningMaterial.types";


export default function AddMaterial(){
    const navigate = useNavigate()

    const [title,setTitle] = useState("")
    const [topic,setTopic] = useState("")
    const [description,setDescription] = useState("")
    const [type,setType] = useState<MaterialType | "">("")
    // const [externalUrl,setExternalUrl] = useState("")
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
        <form onSubmit={handleSubmit}>
            <Input
              label="Title"
              type="text"
              placeholder="Enter a title"
              value={title}
              onChange={setTitle}
            />
            <Input
              label="Topic"
              type="text"
              placeholder="Enter a topic name"
              value={topic}
              onChange={setTopic}
            />
            <Input
              label="Description"
              type="text"
              placeholder="Enter description"
              value={description}
              onChange={setDescription}
            />
            <select
              value={type}
              onChange={(e)=>setType(e.target.value as MaterialType | "")}
              required
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

        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-green-700">{success}</p>}
        <Button
          type="submit"
          label="Save Material"
        />
        <Button
          type="button"
          label="Cancel"
          onClick={()=>navigate("/allLearningMaterials")}
        />

        </form>
        </>

    )
}