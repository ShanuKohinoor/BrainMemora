import { NavLink, useNavigate } from "react-router"
import {logout} from "../features/auth/authSlice"
import { useDispatch } from "react-redux"
import {api} from "../services/api"
import { 
    LayoutDashboard,
    Library,
    NotebookPen,
    Layers,
    Brain,
    ClipboardList,
    Trophy,
    Settings,
    LogOut
} from "lucide-react"


const navigationItems = [
    {label:"Dashboard",path:"/dashboard", icon:LayoutDashboard},
    {label:"My Library",path:"/allLearningMaterials",icon:Library},
    {label:"Notes",path:"/notes",icon:NotebookPen},
    {label:"Flashcards",path:"/flashcards",icon:Layers},
    { label: "Quiz Center", path: "/quiz-center",icon:ClipboardList },
    { label: "AI Assistant", path: "/ai-assistant",icon:Brain },
    { label: "Rewards", path: "/rewards",icon:Trophy },
    { label: "Settings", path: "/settings",icon:Settings }
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
        <aside className="flex min-h-screen w-50 flex-col bg-[#A3B19B] p-4">
            <div className="mb-8 items-center gap-3 px-2 py-2">
                <span className="text-lg font-bold text-[#2D4030]">
                    BrainMemora
                </span>
            </div>
            {navigationItems.map((item)=>(
                <NavLink 
                  key={item.path} 
                  to={item.path}
                  className={({isActive})=>
                   isActive
                   ? "flex items-center gap-3 rounded-lg bg-[#FDF3EC] px-4 py-3 text-[#2D4030]"
                   : "flex items-center gap-3 rounded-lg px-4 py-3 text-[#2D4030] hover:bg-[#FDF3EC]/50"
                   }
                >   
                    <item.icon size={20}/>
                    {item.label}
                    </NavLink>
            ))}
            <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-3 mt-auto font-bold rounded-lg px-4 py-3 text-left text-[#2D4030] hover:bg-[#FDF3EC]/50"
                >
                <LogOut/>
                Logout
            </button>
        </aside>
        
        )}
    </>
    )
}