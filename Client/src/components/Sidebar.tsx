import { NavLink, useNavigate } from "react-router"
import {logout} from "../features/auth/authSlice"
import { useDispatch } from "react-redux"
import {api} from "../services/api"

const navigationItems = [
    {label:"Dashboard",path:"/dashboard"},
    {label:"My Library",path:"/myLibrary"},
    {label:"Notes",path:"/notes"},
    {label:"Flashcards",path:"/flashcards"},
    { label: "Quiz Center", path: "/quiz-center" },
    { label: "AI Assistant", path: "/ai-assistant" },
    { label: "Rewards", path: "/rewards" },
    { label: "Settings", path: "/settings" }
]

export function Sidebar(){
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
        <aside className="flex min-h-screen w-50 flex-col bg-[#A3B19B] p-4">
            {navigationItems.map((item)=>(
                <NavLink 
                  key={item.path} 
                  to={item.path}
                  className={({isActive})=>
                   isActive
                   ? "rounded-lg bg-[#FDF3EC] px-4 py-3 text-[#2D4030]"
                   : "rounded-lg px-4 py-3 text-[#2D4030] hover:bg-[#FDF3EC]/50"
                   }
                >{item.label}</NavLink>
            ))}
            <button
                type="button"
                onClick={handleLogout}
                className="mt-auto rounded-lg px-4 py-3 text-left text-[#2D4030] hover:bg-[#FDF3EC]/50"
                >
                Logout
            </button>
        </aside>
    )
}