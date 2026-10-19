import { Routes,Route } from "react-router"
import { Register } from "./pages/Register"
// import { ProtectedRoute } from "./components/ProtectedRoute"
import  {Login}  from "./pages/Login"
import { lazy,Suspense } from "react"
import { LandingPage } from "./pages/LandingPage"
const Profile = lazy(()=>import("./pages/Profile"))
const Dashboard = lazy (()=>import ("./pages/Dashboard"))
const Materials = lazy (()=>import("./pages/Materials"))
const Flashcards = lazy (()=>import("./pages/Flashcards"))
const Quizzes = lazy(()=>import("./pages/Quizzes"))
const Notes = lazy(()=>import("./pages/Notes"))




export default function App(){
    console.log("App component is running");

  return (
    <Suspense fallback={<div>Loading....</div>}>
        <Routes>
        <Route 
          path="/" 
          element={<LandingPage/>}
        />
        <Route path="/register" element={<Register/>}/>
        <Route path="/login" element={<Login/>}/>
        {/* <Route element={<ProtectedRoute/>}> */}
              <Route path="/dashboard" element={<Dashboard/>}/>
              <Route path="/allLearningMaterials" element={<Materials/>}/>
              <Route path="/notes" element={<Notes/>}/>
              <Route path="/profile" element={<Profile/>}/>
              <Route path="/flashcards" element={<Flashcards/>}/>
              <Route path="/quizzes" element={<Quizzes/>}/>

        {/* </Route> */}
      </Routes>

    </Suspense>
  )
}
