import { UserRound } from "lucide-react";
import {  useNavigate } from "react-router";
import { Button } from "../components/Button";

export function Navbar() {
     const navigate = useNavigate()



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
            <div>
               BrainMemora Navbar
            </div>
            <div className="flex items-center gap-3">
                <button
                type="button"
                onClick={() => navigate("/profile")}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-[#A3B19B] cursor-pointer"
                aria-label="Go to profile"
                >
                <UserRound size={22} />
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