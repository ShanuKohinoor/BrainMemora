import { Navbar } from "./Navbar"
import { Sidebar } from "./Sidebar"

export function DashboardLayout(){ 
    return(
        <>
          <Navbar/>

          <div className="flex">
             <Sidebar/>
             <main className="flex-1">DashboardLayout</main>
          </div>
        </>
    )
}