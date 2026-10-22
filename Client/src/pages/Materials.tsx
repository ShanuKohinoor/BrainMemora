import { Card } from "../components/Card"
import { useEffect,useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { fetchLearningMaterials } from "../features/learningMaterials/learningMaterialSlice";
import { ChevronDown } from "lucide-react";
import { DashboardLayout } from "../components/DashboardLayout";
import { TopicCard } from "../components/TopicCard";

export default function Materials(){    

        // Read shared search from the Redux store
        const search = useAppSelector((state)=>state.search.search)
        
        const [selectedType,setSelectedType] =useState("all")                // Filter by type
        const [selectedCategory, setSelectedCategory] = useState("all")      // Filter by category
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
                ))&&
                (selectedCategory  === "all" || selectedCategory === topic)
        )

        const filteredMaterial = materials.filter((material)=>
            material.title.toLowerCase().includes(search.toLowerCase()) &&
            (selectedType === "all" || material.type === selectedType ) &&
            (selectedTopic === "" || material.topic === selectedTopic) &&
            (selectedCategory === "all" || material.topic === selectedCategory)

        )

    return(
       <>
       <DashboardLayout backLabel="Back to Dashboard" backTo="/dashboard">
        {loading && <p>Loading....</p>}

        {error && <p>{error}</p>}

     <div className="flex justify-start items-center gap-3 px-4 py-2">

        {/* Filter by material type */}
          <div className="relative w-24 shrink-0">
            <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-24 cursor-pointer appearance-none rounded-xl border border-[#D7C8BB] bg-[#FDF3EC] px-3 py-2 text-sm text-[#2D4030] shadow-sm outline-none focus:ring-2 focus:ring-[#A3B19B]"
            >
                <option value="all" hidden>By Type</option>
                <option value="all">All</option>
                <option value="pdf">PDF</option>
                <option value="audio">Audio</option>
                <option value="video">Video</option>
                <option value="image">Image</option>
                <option value="article">Article</option>
                <option value="url">URL</option>
            </select>
                    {/* Dropdown arrow */}
                <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#2D4030]"
                />
         </div>

        {/* Filter by category */}
            <div className="relative w-30 shrink-0">
                <select 
                  value={selectedCategory}
                  onChange={(e)=>setSelectedCategory(e.target.value)}
                  className="w-28 cursor-pointer appearance-none rounded-xl border border-[#D7C8BB] bg-[#FDF3EC] px-3 py-2 text-sm text-[#2D4030] shadow-sm outline-none focus:ring-2 focus:ring-[#A3B19B]"
                >
                    <option value="all" hidden>By Category</option>
                    {topics.map((topic)=>(
                        <option key={topic} value={topic}>
                           {topic}
                        </option>

                    ))}
                </select>
                {/* Dropdown arrow */}
                <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#2D4030]"
                />
            </div>

         </div>

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