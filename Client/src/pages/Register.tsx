import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { useState } from "react";
import {api} from "../services/api"
import { useNavigate } from "react-router";
import { CircleCheck,TriangleAlert } from "lucide-react";

export function Register() {

    const navigate = useNavigate();
    
    const [name,setName] = useState('')
    const [email,setEmail] = useState('')
    const [password,setPassword] = useState('')
    const [confirmPassword,setConfirmPassword] = useState('')
    const [nameError,setNameError] = useState('')
    const [emailError,setEmailError] = useState('')
    const [passwordError,setPasswordError] = useState('')
    const [confirmPasswordError,setConfirmPasswordError] = useState('')
    const [apiError,setApiError] = useState('')
    const [successMessage,setSuccessMessage] = useState('')
  
    const handleSubmit: React.ComponentProps<"form">["onSubmit"] = async(e)=>{
        e.preventDefault()

        setNameError("")
        setEmailError("")
        setPasswordError("")
        setConfirmPasswordError("")
        setApiError("");
        setSuccessMessage("");

        if(!name){
            setNameError("Please enter name")
        }
        if(!email){
            setEmailError("Please enter email")
        }
        if(!password){
            setPasswordError("Please enter password")
        }

        if (!confirmPassword){
          setConfirmPasswordError("Please enter password again")
        }

       if(!name || !email || !password || !confirmPassword) return 


   
       if (password.length < 6) {
          setPasswordError("Password must be at least 6 characters");
          return;
        }

        if (password !== confirmPassword) {
          setConfirmPasswordError("Passwords do not match");
          return
        }





        const nameRegex = /^[A-Za-z\s]+$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if(!nameRegex.test(name)){
          setNameError("Name should contain only letters")
          return
        }

        if(!emailRegex.test(email)){
          setEmailError("Please enter a valid email address")
          return
        }


       try{
        setApiError("")
        setSuccessMessage("")

        // Send registration detail to backend api
        await api.post('/api/auth/register',{
            name,
            email,
            password
        })
          // Display successful notification after the API request succeed
          setSuccessMessage("Account created successfully")
          
          // Redirect user to login page after 2 secs
          setTimeout(()=>{
            navigate('/login')
          },2000)

       }catch(error:any){
            setApiError(
                 error.response?.data?.message ||            // Display backend error message when it is available.
                "Registration failed. Please try again"      //  Otherwise display general registration error                
            )
       }

    }


  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F8EDE5] px-4 py-8">
      {/* Successful message Notification */}
      {successMessage && (
        <div
          className="
            fixed
            top-4
            right-4
            sm:top-6
            sm:right-6
            bg-[#8cc63f]
            text-white
            px-3
            py-2
            sm:px-5
            sm:py-3
            rounded-xl
            sm:rounded-2xl
            shadow-xl
            z-50
            font-semibold
            flex
            items-center
            gap-1.5
            sm:gap-2
            text-xs
            sm:text-sm
            max-w-[260px]
            sm:max-w-none
            overflow-hidden
          "
        >
          <CircleCheck 
            className="text-sm sm:text-base shrink-0"
          />

          <span>
            {successMessage}
          </span>

          <div
            className="
              absolute
              bottom-0
              left-0
              h-1
              w-full
              bg-white/80
              animate-[shrink_2s_linear_forwards]
            "
          />
        </div>
      )}
       {/* Display backend error notification only when error exists */}
       {apiError && (
        <div className="
           fixed 
           top-4 
           right-4
           bg-[#EF4444]
           text-sm 
           text-white
            px-3
            py-2
            sm:px-5
            sm:py-3
            rounded-xl
            sm:rounded-2xl
            shadow-xl
            z-50
            font-semibold
            flex
            items-center
            gap-1.5
            sm:gap-2
            text-xs
            sm:text-sm
            max-w-[260px]
            sm:max-w-none
            overflow-hidden
          ">
            <TriangleAlert className="shrink-0" size={18} />
            {apiError}
        </div>)}


      <section className="w-full max-w-md rounded-3xl bg-[#FDF3EC] p-6 shadow-[10px_10px_30px_#e2d4ca,-10px_-10px_30px_#ffffff] sm:p-8">

        {/* Login and Sign Up tabs */}
        <div className="mb-8 grid grid-cols-2 border-b border-[#E8DED7]">
          <a
            href="/login"
            className="py-3 text-center text-lg font-semibold text-[#A3B19B]"
          >
            Log In
          </a>

          <button
            type="button"
            className="border-b-4 border-[#F27A58] py-3 text-lg font-semibold text-[#4A4A4A]"
          >
            Sign Up
          </button>
        </div>

        {/* Register heading */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-[#2D4030]">
            Create Your Account
          </h1>

          <p className="mt-2 text-sm text-[#6B7567]">
            Start your learning journey with BrainMemora.
          </p>
        </div>

        {/* Register form */}
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">

          <Input
            id="name"
            label="Full Name"
            type="text"
            placeholder="Enter your full name"
            value={name}
            onChange={setName}
          />
          {nameError && <p className="text-sm text-red-500">{nameError}</p>}

          <Input
            id="email"
            label="Email Address"
            type="email"
            placeholder="Enter your Email"
            value={email}
            onChange={setEmail}
          />
          {emailError && <p className="text-sm text-red-500">{emailError}</p>}

          <Input
            id="password"
            label="Password"
            type="password"
            placeholder="Create a Password"
            value={password}
            onChange={setPassword}

          />
         {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}


          <Input
            id="confirmPassword"
            label="Confirm Password"
            type="password"
            placeholder="Confirm your Password"
            value={confirmPassword}
            onChange={setConfirmPassword}

          />
          {confirmPasswordError && <p className="text-sm text-red-500">{confirmPasswordError}</p>}

          {/* Create account button */}
          <Button 
          label="Create Account"
          type="submit" />

        </form>

        {/* Divider */}
        <div className="my-7 flex items-center gap-3">
          <div className="h-px flex-1 bg-[#E8DED7]"></div>

          <span className="text-sm text-[#4A4A4A]">
            or continue with
          </span>

          <div className="h-px flex-1 bg-[#E8DED7]"></div>
        </div>

        {/* Google button */}
        <button
          type="button"
          className="flex w-full items-center justify-center gap-3 rounded-xl bg-white py-3.5 font-semibold text-[#222222] shadow-[0_4px_12px_rgba(50,35,25,0.08)] transition hover:shadow-md"
        >
          <GoogleIcon />
          Google
        </button>

        {/* Login link */}
        <p className="mt-7 text-center text-sm text-[#222222]">
          Already have an account?{" "}
          <a
            href="/login"
            className="font-semibold text-[#F27A58] underline"
          >
            Log In
          </a>
        </p>

      </section>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg
      viewBox="0 0 48 48"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 01-4.1 6.2v5.1h6.6c3.9-3.6 6.1-8.9 6.1-15z"
      />
      <path
        fill="#34A853"
        d="M24 44c5.5 0 10.1-1.8 13.5-4.9l-6.6-5.1c-1.8 1.2-4.1 2-6.9 2-5.3 0-9.8-3.6-11.4-8.4H5.8v5.3A20 20 0 0024 44z"
      />
      <path
        fill="#FBBC05"
        d="M12.6 27.6a12 12 0 010-7.2v-5.3H5.8a20 20 0 000 17.8z"
      />
      <path
        fill="#EA4335"
        d="M24 12c3 0 5.7 1 7.8 3.1l5.8-5.8A19.4 19.4 0 0024 4 20 20 0 005.8 15.1l6.8 5.3C14.2 15.6 18.7 12 24 12z"
      />
    </svg>
  );
}
