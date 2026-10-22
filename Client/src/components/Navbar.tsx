import { UserRound,Bell,Menu } from "lucide-react";
import {  useNavigate,useLocation } from "react-router";
import { Button } from "../components/Button";
import { Input } from "./Input";
import { useAppDispatch,useAppSelector } from "../app/hooks";
import { setSearch } from "../features/search/searchSlice";

// Define the props recieved by the Navbar
type NavbarProps ={              // Tell typescript what information Navbar component is allowed to recieve.(For setting sidebar open & close)
   onMenuClick: ()=> void         //  ()- function takes no Argument 
                                  //   void - Doesn't return a value
}                             
export function Navbar({onMenuClick}:NavbarProps) {       // Recieve sidebar toggle function from dashboardlayout
        const navigate = useNavigate()
        const location = useLocation();
 
        // Read current search text from the redux
        const search = useAppSelector((state)=>state.search.search)

        // Get the function used to dispatch Redux actions
        const dispatch = useAppDispatch()

        // Update the search text in the Redux
        const handleSearch = (text:string)=>{
            dispatch(setSearch(text))
        }

        const pageTitles: Record<string, string> = {
            "/dashboard": "Dashboard",
            "/notes": "My Notes",
            "/allLearningMaterials": "My Library",
            "/addMaterial": "My Library",
            "/quiz": "Quiz Center",
            "/flashcards": "Flashcards",
            "/profile": "My Profile",
        };

const pageTitle = pageTitles[location.pathname] || "BrainMemora";
    return(
        <nav className="
             flex 
             justify-between 
             items-center
             text-[#2D4030]
             bg-[#FDF3EC]
             px-6
             py-4
        ">
            {/* call the toggle function when the hamburger is clicked */}
            <button
               type="button"
               onClick={onMenuClick}
            >
                <Menu size={24}/>
            </button>
           <div className="font-serif text-4xl text-[#2D4030]">
              {pageTitle}          
            </div>
             <div>
                <Input
                     type="text"
                     value={search}
                     placeholder="Search Materials....."
                     onChange={handleSearch}
                />
            
             </div>
            
            <div className="flex items-center gap-3">
                <button className="text-black" >
                    <Bell size={22} className="text-[#2D4030]" />
                </button>
                <button
                type="button"
                onClick={() => navigate("/profile")}
                className="flex items-center justify-center w-16 h-10 rounded-full bg-[#A3B19B] cursor-pointer"
                aria-label="Go to profile"
                >
                <UserRound size={24} />
                </button>

                <Button
                    type="button"
                    label="Add Material"
                    onClick={()=>navigate("/addMaterial")}
                 />
            </div>

        </nav>
    )
}