import { Card } from "../components/Card"
import { useEffect,useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { fetchLearningMaterials } from "../features/learningMaterials/learningMaterialSlice";
import { Input } from "../components/Input";
        

import { DashboardLayout } from "../components/DashboardLayout";
import { TopicCard } from "../components/TopicCard";
import { Button } from "../components/Button";

export default function Materials(){    
        const [search,setSearch] = useState("")

        const [selectedType,setSelectedType] =useState("all")
        const [selectedTopic,setSelectedTopic] = useState("")


        const dispatch = useAppDispatch();
        const {loading,materials,error} = useAppSelector(
            (state)=>state.learningMaterials
        )

        useEffect(()=>{
          dispatch(fetchLearningMaterials())
        },[dispatch])

        // Get unique topic names for topic card
        const topics = [...new Set(materials.map((material)=>material.topic))]

        const filteredTopics = topics.filter((topic) =>
            topic.toLowerCase().includes(search.toLowerCase()) &&
            (selectedType === "all" ||
                materials.some((material) =>
                    material.topic === topic &&
                    material.type === selectedType
                ))
        )

        const filteredMaterial = materials.filter((material)=>
            material.title.toLowerCase().includes(search.toLowerCase()) &&
            (selectedType === "all" || material.type === selectedType ) &&
            (selectedTopic === "" || material.topic === selectedTopic)

        )

    return(
       <>
       <DashboardLayout>
        <Button
          label="Back button"
          onClick={()=>setSelectedTopic("")}/>
            <div>
                <Input
                type="text"
                value={search}
                placeholder="Search Materials"
                onChange={setSearch}
                />

            </div>

        {loading && <p>Loading....</p>}

        {error && <p>{error}</p>}
        <select
          value={selectedType}
          onChange={(e)=>setSelectedType(e.target.value)}>
            <option value="all">All</option>
            <option value="pdf">PDF</option>
            <option value="audio">Audio</option>
            <option value="video">Video</option>
            <option value="image">Image</option>
            <option value="article">Article</option>
            <option value="url">URL</option>
        </select>
{selectedTopic === "" ? (
    <>
        {/* Show matching topic cards */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-2 px-16 py-4">
            {filteredTopics.map((topic) => (
                <TopicCard
                    key={topic}
                    title={topic}
                    description={
                        materials.find((item) => item.topic === topic)?.description
                    }
                    progress={0}
                    onOpenMaterials={() => setSelectedTopic(topic)}
                />
            ))}
        </div>

        {/* Show matching material titles when searching */}
        {search.trim() !== "" &&
            filteredMaterial.map((material) => (
                <Card
                    key={material._id}
                    title={material.title}
                    description={material.description}
                    type={material.type}
                    fileUrl={material.fileUrl}
                    externalUrl={material.externalUrl}
                />
            ))}

        {/* Show a message if nothing matches */}
        {search.trim() !== "" &&
            filteredTopics.length === 0 &&
            filteredMaterial.length === 0 && (
                <p className="px-16 py-4">
                    No topics or materials found.
                </p>
            )}
    </>
) : (
    filteredMaterial.map((material) => (
        <Card
            key={material._id}
            title={material.title}
            description={material.description}
            type={material.type}
            fileUrl={material.fileUrl}
            externalUrl={material.externalUrl}
        />
    ))
)}

        </DashboardLayout>
       </> 
       
    )
}