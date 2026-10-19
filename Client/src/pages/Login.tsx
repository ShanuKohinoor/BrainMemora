
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { useState} from "react";
import { useDispatch } from "react-redux";
import {login} from "../features/auth/authSlice"
import {api} from "../services/api"
import { useNavigate } from "react-router";
import { CircleCheck,TriangleAlert } from "lucide-react";

export function Login() {

    const dispatch = useDispatch()
    const navigate = useNavigate()

    const [email,setEmail] = useState('')
    const [password,setPassword] = useState('')
    const [emailError,setEmailError] = useState('')
    const [passwordError,setPasswordError] = useState('')
    const [successMessage,setSuccessMessage] = useState('')
    const [apiError,setApiError] = useState('')


    const handleSubmit: React.ComponentProps<"form">["onSubmit"]= async (e)=>{
        e.preventDefault()
        

        setEmailError("")
        setPasswordError("")
        setSuccessMessage("")
        setApiError("")
        

        if(!email){
            setEmailError("Please enter email")
        }
        if(!password){
            setPasswordError("Please enter password")
        }

        if(!email || !password) return

       const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email)){
          setEmailError("Please enter a valid email address")
          return
        }

        try{
            const response = await api.post("/api/auth/login",{
                email,
                password
            })

            const userData= response.data.data     //response.data is entire JSON response(success,message,data from backend)
                                                    // response.data.data means data alone inside the JSON response
            dispatch(login({user:userData}))
            console.log("Login successful — action dispatched");
            setSuccessMessage(response.data.message)   // Display the success message returned from the backend


          setTimeout(()=>{
            navigate('/dashboard')
          },2000)
        }catch(error:any){
          setApiError(
            error.response?.data?.message ||
            "Invalid email or password. Please try aagain");
          
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
    {/* Display backend error */}
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
          <button
            type="button"
            className="border-b-4 border-[#F27A58] py-3 text-lg font-semibold text-[#4A4A4A]"
          >
            Log In
          </button>

        <a
        href="/register"
        className="py-3 text-center text-lg font-semibold text-[#A3B19B]"
        >
        Sign Up
        </a>
        </div>

        {/* Login form */}
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">

          <Input
            id="email"
            label="Email Address"
            placeholder="Enter your Email"
            type="email"
            value={email}
            onChange={setEmail}
          />
           {emailError && <p className="text-sm text-red-500">{emailError}</p>}
          <Input
            id="password"
            label="Password"
            placeholder="Enter your Password"
            type="password"
            rightLabel="Forgot Password?"
            value={password}
            onChange={setPassword}
          />
          {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}

          {/* Remember me */}
          <label className="flex items-center gap-2 text-sm text-[#6B7567]">
            <input
              type="checkbox"
              className="h-5 w-5 accent-[#F27A58]"
            />
            Remember me
          </label>

          {/* Login button */}
          <Button
           label="Login"
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
        {/* Sign Up link */}
        <p className="mt-7 text-center text-sm text-[#222222]">
          Don't have an account?{" "}
          <a
            href="/register"
            className="font-semibold text-[#F27A58] underline"
          >
            Sign Up
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

