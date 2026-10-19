import {api} from "../services/api"
import { useEffect, useState } from "react"
import {logout} from "../features/auth/authSlice"
import { useDispatch } from "react-redux"
import {useNavigate} from "react-router"
import { Button } from "../components/Button"
import { Input } from "../components/Input"


// Define the structure of user profile
type UserProfile = {
    name:string;
    email:string
}
export default function Profile(){

    const dispatch = useDispatch()
    const navigate = useNavigate()

    // Store profile data. Initially,no profile available
    const [profile,setProfile] = useState<UserProfile | null>(null)

    // Store any error message 
    const[error,setError] = useState("")


    const [updatedName,setUpdatedName]= useState("")
    const [updatedEmail,setUpdatedEmail]= useState("")
    const [updateError,setUpdateError] = useState("")

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


     //Update profile 
     const handleUpdate = async()=>{
      try{
            const response = await api.put('/api/user/profile',{
            name:updatedName,
            email:updatedEmail
        })
          
        setProfile(response.data.data)
      }catch(error){
        setUpdateError("Failed to update profile. Please try again later")
      }


      }
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
          <h1>
            Welcome to Profile Page
          </h1>
          <p>
            Name:{profile.name}
          </p>
          <p>
            Email:{profile.email}
          </p>
          <Button 
            label="Logout"
            onClick={handleLogout}

          />
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
          <Button
            label="Update Profile"
            onClick={handleUpdate}
          />
          {updateError && <p className="text-sm text-red-500">{updateError}</p>}
        </>

    )
}