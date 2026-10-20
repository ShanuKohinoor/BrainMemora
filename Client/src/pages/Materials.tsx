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

        const filteredMaterial = materials.filter((material)=>
            material.title.toLowerCase().includes(search.toLowerCase()) &&
            (selectedType === "all" || material.type === selectedType ) &&
            material.topic === selectedTopic

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

        <h1>
          Welcome to Material Page
        </h1>
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
            <option value="notes">Notes</option>
        </select>
        {selectedTopic === "" ?(
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-2 px-16 py-4">
            {topics.map((topic)=>(
                <TopicCard
                   key={topic}
                   title={topic}
                   description={materials.find((item)=>item.topic === topic)?.description}
                   progress={0}
                   onOpenMaterials={()=>setSelectedTopic(topic)}
                   />
            ))}
            
           </div>
           ):(

        filteredMaterial.map((material)=>(
          <Card 
             key={material._id}
             title = {material.title}
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