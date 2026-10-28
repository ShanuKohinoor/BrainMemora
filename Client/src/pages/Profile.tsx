import {api} from "../services/api"
import { useEffect, useState } from "react"
import { Button } from "../components/Button"
import { Input } from "../components/Input"
import { DashboardLayout } from "../components/DashboardLayout";
import {UserRound} from "lucide-react"



// Define the structure of user profile
type UserProfile = {
    name:string;
    email:string
}
export default function Profile(){

    // Store profile data. Initially,no profile available
    const [profile,setProfile] = useState<UserProfile | null>(null)

    // Store any error message 
    const[error,setError] = useState("")


    const [updatedName,setUpdatedName]= useState("")
    const [updatedEmail,setUpdatedEmail]= useState("")
    const [updateError,setUpdateError] = useState("")
    const [isEditing, setIsEditing] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    // Fetch the profile when components loads
     useEffect(()=>{
        const fetchProfile = async()=>{
            try{
                //Send a GET request to backend to get profile
                const response = await api.get('/api/user/profile')

                //Store the profile data recieved from the backend
                setProfile(response.data.data)
                setUpdatedName(response.data.data.name)     // Store name after updation
                setUpdatedEmail(response.data.data.email)    // Store email after updation

            }catch(error){

                // If the request fails display the error
                setError("Failed to fetch profile")
            }
        }
        // Call to fetch the profile
        fetchProfile()
     },[])


     // Handle delete account
     const handleDeleteAccount = async()=>{
      try{
         await api.delete("/api/user/delete")

      }catch(error){
            console.error("Delete account error:", error)

        setError("Failed to delete Account. Please try again later")
      }
     }

     //Update profile 
      const handleUpdate = async()=>{
        try{
              const response = await api.put('/api/user/profile',{
              name:updatedName,
              email:updatedEmail
          })
            
          setProfile(response.data.data)
          setIsEditing(false)
          setUpdateError("")

        }catch(error){
          setUpdateError("Failed to update profile. Please try again later")
        }

      }


     // Display error message if request fails
    if(error){
      return <p>{error}</p>
    }
     // Dispaly loading message while waiting for the profile
      if(!profile){
        return <p>Loading profile...</p>
      }



      // Display the users profile after the data is loaded
    return(
        <>
         <DashboardLayout>
          <div className="mx-auto w-full max-w-lg rounded-3xl bg-[#FDF3EC] p-6 shadow-[10px_10px_30px_#e2d4ca,-10px_-10px_30px_#ffffff] sm:p-8">
            <h1 className="mb-6 text-center text-4xl font-bold tracking-wide text-[#2D4030] ">
              Profile
            </h1>
          <div className="mx-auto w-full max-w-lg rounded-4xl bg-[#FDF3EC] p-3 shadow-[10px_10px_30px_#e2d4ca,-10px_-10px_30px_#ffffff] sm:p-4">
           <div className="mx-auto w-full max-w-lg rounded-3xl bg-[#FDF3EC] p-6 shadow-[10px_10px_30px_#e2d4ca,-10px_-10px_30px_#ffffff] sm:p-8">

              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-xl bg-[#FDF3EC] shadow-[4px_4px_10px_#e2d4ca,-4px_-4px_10px_#ffffff]">
                <UserRound className="h-8 w-8 text-[#2D4030]" />
              </div>


              <p className="w-full space-y-3 px-4 text-2xl text-[#2D4030] font-medium mb-2">
                Name: {profile.name}
              </p>
              <p className="w-full space-y-3 px-4 text-2xl text-[#2D4030]  font-medium mb-2">
                Email: {profile.email}
              </p>
              <div className="flex w-full gap-3 px-4 py-4">
                  <button
                  onClick={()=>setShowDeleteConfirm(true)}
                      className="flex-1 min-w-0 py-3 rounded-xl text-xs font-semibold text-[#8C5D53] bg-[#FDF3EC] border border-[#8C5D53]/40 shadow-[4px_4px_10px_#e5d7cc,-4px_-4px_10px_#ffffff] hover:bg-[#8C5D53]/10 transition-all duration-200"
                   >
                    Delete Account
                  </button>
                  
              {!isEditing && (
                <button
                     className="flex-1 min-w-0 py-3 rounded-xl text-xs font-semibold text-[#8C5D53] bg-[#FDF3EC] border border-[#8C5D53]/40 shadow-[4px_4px_10px_#e5d7cc,-4px_-4px_10px_#ffffff] hover:bg-[#8C5D53]/10 transition-all duration-200"
                  onClick={() => {
                    setUpdatedName(profile.name);
                    setUpdatedEmail(profile.email);
                    setUpdateError("");
                    setIsEditing(true);
                  }}
                >
                  Edit Personal Details
                </button>
              )}

              </div>

               {/* Delete account confirmation */}
              {showDeleteConfirm && (
                <div className="absolute inset-0 z-20 flex items-center justify-center rounded-3xl bg-[#FDF3EC]/95 p-4">
                  <div className="w-full max-w-xs rounded-xl border border-[#E8DED3] bg-white p-4 shadow-lg">
                    <h3 className="font-semibold text-[#2D4030]">
                      Are you sure?
                    </h3>

                    <p className="mt-2 text-sm text-gray-600">
                      Are you sure you want to delete your account? This action cannot be undone.
                    </p>

                    <div className="mt-4 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(false)}
                        className="rounded-lg border border-[#E8DED3] px-3 py-2 text-sm text-[#2D4030] hover:bg-[#FDF3EC]"
                      >
                        Cancel
                      </button>

                      <button
                        type="button"
                        onClick={handleDeleteAccount}
                        className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}


              {/* Show the inputs only when editing */}
              {isEditing && (
                <>
                  <Input
                    id="name"
                    label="Name"
                    type="text"
                    value={updatedName}
                    onChange={setUpdatedName}
                  />

                  <Input
                    id="email"
                    label="Email"
                    type="email"
                    value={updatedEmail}
                    onChange={setUpdatedEmail}
                  />

                  <div className="flex gap-3 mt-6">
                    <Button
                      label="Save Changes"
                      onClick={handleUpdate}
                    />

                    <Button
                      label="Cancel"
                      onClick={() => {
                        setUpdatedName(profile.name)
                        setUpdatedEmail(profile.email)
                        setIsEditing(false)
                        setUpdateError("")
                      }}
                    />
                  </div>
                </>
              )}


              {/* Display an update error if saving fails */}
              {updateError && <p className="text-sm text-red-500">{updateError}</p>}

               {/* Achievements Button */}
            <div className="flex justify-center mt-2">
              <div className="w-44">

               <Button 
              
                label="Achievements"
               />
               </div>
             </div>
           </div>
          </div>
        </div>

        </DashboardLayout>

        </>

    )
}




