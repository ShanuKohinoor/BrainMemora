import { Card } from "../components/Card"
import { useEffect,useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { Input } from "../components/Input";
import { fetchLearningMaterials } from "../features/learningMaterials/learningMaterialSlice";
import { Button } from "../components/Button";


export default function Materials(){    

        const [search,setSearch] = useState("")
        const [selectedType,setSelectedType] =useState("all")

        const [showForm,setShowForm] = useState(false)

        const dispatch = useAppDispatch();
        const {loading,materials,error} = useAppSelector(
            (state)=>state.learningMaterials
        )

        useEffect(()=>{
          dispatch(fetchLearningMaterials())
        },[dispatch])

        const filteredMaterial = materials.filter((material)=>
            material.title.toLowerCase().includes(search.toLowerCase()) &&
            (selectedType === "all" || material.type === selectedType )
        )

    return(
       <>
       <Button
         type="button"
         label="Add Material"
         onClick={()=>setShowForm(true)}
        />
        {showForm && 
         <div>
            <h2>Add New Material</h2>
         </div>
        }
        <h1>
          Welcome to Material Page
        </h1>
        <Input
          type="text"
          value={search}
          placeholder="Search Materials"
          onChange={setSearch}
        />
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

        {filteredMaterial.map((material)=>(
          <Card 
             key={material._id}
             title = {material.title}
             description={material.description}
             type={material.type}
             fileUrl={material.fileUrl}
             externalUrl={material.externalUrl}
          />

        ))}



       </> 
       
    )
}