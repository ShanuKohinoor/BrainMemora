
import { Card } from "../components/Card"
import { useEffect,useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { useNavigate } from "react-router";
import { fetchLearningMaterials } from "../features/learningMaterials/learningMaterialSlice";
import { ChevronDown } from "lucide-react";
import { DashboardLayout } from "../components/DashboardLayout";
import { TopicCard } from "../components/TopicCard";
import {
    deleteMaterial,
    updateMaterial,
} from "../services/learningMaterialService";
import type { MaterialType } from "../types/learningMaterial.types";

export default function Materials(){    

        const navigate = useNavigate();

            // Background colors for topic cards.
            const topicCardColors = [
            "#F2D69B",
            "#B5CDA8",
            "#A7C1D0",
            "#D9A399",
            ];

            // Background colors for material cards.
            const cardColors = [
            "#E8DFF5",
            "#F6DFD5",
            "#DCECE5",
            "#DDE7F5",
            ];
        // Read shared search from the Redux store
        const search = useAppSelector((state)=>state.search.search)
        
        const [selectedType,setSelectedType] =useState("all")                // Filter by type
        const [selectedCategory, setSelectedCategory] = useState("all")      // Filter by category
        const [selectedTopic,setSelectedTopic] = useState("")

        // Track which material is being deleted or updated.
        const [deletingId, setDeletingId] = useState<string | null>(null);
        const [updatingId, setUpdatingId] = useState<string | null>(null);

        // Track which topic is being edited or deleted.
        const [editingTopic, setEditingTopic] = useState<string | null>(null);
        const [deletingTopic, setDeletingTopic] = useState<string | null>(null);

        const dispatch = useAppDispatch();
        const {loading,materials,error} = useAppSelector(
            (state)=>state.learningMaterials
        )

        useEffect(()=>{
          dispatch(fetchLearningMaterials())
        },[dispatch])

        // Delete a material and refresh the list.
        const handleDelete = async (id: string): Promise<void> => {
            try {
                setDeletingId(id);
                await deleteMaterial(id);
                await dispatch(fetchLearningMaterials());
            } catch (error) {
                console.error("Failed to delete material:", error);
            } finally {
                setDeletingId(null);
            }
        };

        // Update a material and refresh the list.
        const handleUpdate = async (
            id: string,
            data: { title: string; topic: string; type: MaterialType }
        ): Promise<boolean> => {
            try {
                setUpdatingId(id);
                await updateMaterial(id, data);
                await dispatch(fetchLearningMaterials());
                return true;
            } catch (error) {
                console.error("Failed to update material:", error);
                return false;
            } finally {
                setUpdatingId(null);
            }
        };

        // Rename a topic by updating its learning materials.
        const handleEditTopic = async (
            oldTitle: string,
            newTitle: string
        ): Promise<boolean> => {
            try {
                setEditingTopic(oldTitle);

                const topicMaterials = materials.filter(
                    (material) => material.topic === oldTitle
                );

                for (const material of topicMaterials) {
                    await updateMaterial(material._id, {
                        title: material.title,
                        topic: newTitle,
                        type: material.type,
                    });
                }

                await dispatch(fetchLearningMaterials());
                return true;
            } catch (error) {
                console.error("Failed to update topic:", error);
                return false;
            } finally {
                setEditingTopic(null);
            }
        };

        // Delete a topic and its associated learning materials.
        const handleDeleteTopic = async (topic: string): Promise<void> => {
            try {
                setDeletingTopic(topic);

                const topicMaterials = materials.filter(
                    (material) => material.topic === topic
                );

                for (const material of topicMaterials) {
                    await deleteMaterial(material._id);
                }

                if (selectedTopic === topic) {
                    setSelectedTopic("");
                }

                if (selectedCategory === topic) {
                    setSelectedCategory("all");
                }

                await dispatch(fetchLearningMaterials());
            } catch (error) {
                console.error("Failed to delete topic:", error);
            } finally {
                setDeletingTopic(null);
            }
        };

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
        <DashboardLayout
            backLabel={selectedTopic === "" ? "Back to Dashboard" : "Back to Library"}
            backTo="/dashboard"
            onBack={
                selectedTopic === ""
                    ? undefined
                    : () => setSelectedTopic("")
            }
        >
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
         <div className="grid grid-cols-1 gap-6 px-4 py-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredTopics.map((topic,index) => (
                <TopicCard
                    key={topic}
                    title={topic}
                    description={
                        materials.find((item) => item.topic === topic)?.description
                    }
                    progress={0}
                    color={topicCardColors[index % cardColors.length]}
                    onOpenMaterials={() => setSelectedTopic(topic)}
                    onGenerateFlashcards={() =>
                    navigate("/flashcards", {
                        state: { topic },
                    })
                    }              
                   onEdit={(newTitle) => handleEditTopic(topic, newTitle)}
                    onDelete={() => handleDeleteTopic(topic)}
                    isEditing={editingTopic === topic}
                    isDeleting={deletingTopic === topic}
                />
            ))}
        </div>

        {/* Show matching material titles when searching */}
        {search.trim() !== "" && (
            <div className="grid grid-cols-1 gap-6 px-4 py-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredMaterial.map((material,index) => (
                    <Card
                        key={material._id}
                        _id={material._id}
                        color={cardColors[index % cardColors.length]}
                        title={material.title}
                        topic={material.topic}
                        description={material.description}
                        type={material.type}
                        fileUrl={material.fileUrl}
                        externalUrl={material.externalUrl}
                        onDelete={handleDelete}
                        onUpdate={handleUpdate}
                        isDeleting={deletingId === material._id}
                        isUpdating={updatingId === material._id}
                    />
                ))}
            </div>
        )}

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
<div className="grid grid-cols-1 gap-6 px-4 py-4 md:grid-cols-2">
                {filteredMaterial.map((material,index) => (
            <Card
                key={material._id}
                _id={material._id}
                color={cardColors[index % cardColors.length]}
                title={material.title}
                topic={material.topic}
                description={material.description}
                type={material.type}
                fileUrl={material.fileUrl}
                externalUrl={material.externalUrl}
                onDelete={handleDelete}
                onUpdate={handleUpdate}
                isDeleting={deletingId === material._id}
                isUpdating={updatingId === material._id}
            />
        ))}
    </div>
)}

        </DashboardLayout>
       </> 
       
    )
}
