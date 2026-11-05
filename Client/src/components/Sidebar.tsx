import { NavLink, useNavigate } from "react-router"
import {logout} from "../features/auth/authSlice"
import { useDispatch } from "react-redux"
import {api} from "../services/api"
import { 
    Home,
    LibraryBig,
    NotebookPen,
    Layers,
    FileQuestion,
    GraduationCap,
    Bot,
    Trophy,
    Settings,
    LogOut
} from "lucide-react"


const navigationItems = [
    {label:"Dashboard",path:"/dashboard", icon:Home},
    {label:"My Library",path:"/allLearningMaterials",icon:LibraryBig},
    {label:"Notes",path:"/notes",icon:NotebookPen},
    {label:"Flashcards",path:"/flashcards",icon:Layers},
    {label: "Quiz Center", path: "/quizzes",icon:FileQuestion },
    {label: "Learning Session", path: "/learningSession",icon:GraduationCap },
    {label: "AI Assistant", path: "/ai-assistant",icon:Bot },
    {label: "Rewards", path: "/rewards",icon:Trophy },
    {label: "Settings", path: "/settings",icon:Settings }
]

// Define the sidebar visibility props
type sideBarOpenProps ={
  isOpen:boolean
}

export function Sidebar({isOpen}:sideBarOpenProps){ // Receive the visibility state from DashboardLayout
        const dispatch = useDispatch()
        const navigate = useNavigate()
                   // Logout
              const handleLogout = async ()=>{
                try{
                  await api.post('/api/auth/logout')
                  dispatch(logout())
                  navigate('/login')
                }catch(error){
                    console.error('Logout failed:',error)
                }
              }
        

    return(
      <>
       {/* Dispaly the sidebar only when it is open */}
        {isOpen && (
            <aside className="fixed left-0 top-0 z-40 flex h-screen w-60 flex-col overflow-hidden bg-[#A3B19B] p-4">

                {/* Logo */}
                <div className="mb-6 px-2 py-2">
                    <span className="text-lg font-bold text-[#2D4030]">
                        BrainMemora
                    </span>
                </div>

                {/* Navigation links */}
                <nav className="flex flex-col gap-1">
                    {navigationItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                isActive
                                    ? "flex items-center gap-3 whitespace-nowrap rounded-full bg-[#FDF3EC]/80 px-3 py-2.5 text-[#2D4030]"
                                    : "flex items-center gap-3 whitespace-nowrap rounded-full bg-[#FDF3EC]/20 px-3 py-2.5 text-[#2D4030] hover:bg-[#FDF3EC]/50"
                            }
                        >
                            <item.icon size={20} />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                {/* Logout */}
                <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-auto flex shrink-0 items-center gap-3 rounded-lg px-3 py-3 font-bold text-[#2D4030] hover:bg-[#FDF3EC]/50"
                >
                    <LogOut size={20} />
                    Logout
                </button>

            </aside>
        )}
    </>
);
}