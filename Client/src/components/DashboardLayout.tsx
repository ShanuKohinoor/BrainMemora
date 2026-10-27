import { ArrowLeft } from "lucide-react"
import { Navbar } from "./Navbar"
import { Sidebar } from "./Sidebar"
import { useState } from "react"
import type{ ReactNode } from "react"   // Import Rectnode type to define what content can be passed into a component
import { useNavigate } from "react-router"

type DashboardProp = {
    children: ReactNode;           // Allows the layout to recieve page content(current page content)
    backLabel?:string;             // Text displayed on the button
    backTo?:string;                // Destination page to open
    onBack?: () => void;
}

export function DashboardLayout({children,backLabel,backTo,onBack}:DashboardProp){ 

    const navigate = useNavigate();

    // Store whether the sidebar is open or not
    const[isSideBarOpen,setIsSideBarOpen] = useState(true)


    // Toggle the sidebar when hamburger clicked
    const handleMenuClick = ()=>{
        setIsSideBarOpen(!isSideBarOpen)
    }
    return(
        <>
         <div className="flex min-h-screen">
           <Sidebar isOpen={isSideBarOpen}/>               {/* Tell the sidebar whether to show or hide */}
             <div className={`flex min-w-0 flex-1 flex-col bg-[#FDF3EC] ${isSideBarOpen ? "ml-50" : "ml-0"}`}>            
              
              {/* Allow Navbar to open or close the sidebar */}
               <Navbar onMenuClick={handleMenuClick}  
               />     
               <main className="flex-1">
                  <button className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-[#2D4030] hover:bg-[#A3B19B]/20 transition-colors"
                    onClick={() => {
                            if (onBack) {
                                onBack();
                            } else if (backTo) {
                                navigate(backTo);
                            }
                  }}       
                  >      
                    <ArrowLeft size={18}/>
                    {backLabel}
                  </button>
                  {children}                                {/*Dispaly the current page */}
              </main> 
             </div>
          </div>

        </>
    )
}