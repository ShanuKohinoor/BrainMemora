import { Navbar } from "./Navbar"
import { Sidebar } from "./Sidebar"
import { useState } from "react"
import type{ ReactNode } from "react"   // Import Rectnode type to define what content can be passed into a component

type DashboardProp = {
    children: ReactNode;           // Allows the layout to recieve page content
}

export function DashboardLayout({children}:DashboardProp){ 
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
             <div className={`flex min-w-0 flex-1 flex-col bg-[#FDF3EC] ${isSideBarOpen ? "ml-50" : "ml-0"}`}>               <Navbar onMenuClick={handleMenuClick}/>      {/* Allow Navbar to open or close the sidebar */}
               <main className="flex-1">
                  {children}                                {/*Dispaly the current page */}
              </main> 
             </div>
          </div>

        </>
    )
}