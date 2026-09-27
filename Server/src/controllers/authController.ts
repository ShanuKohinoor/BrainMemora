import type { RegisterRequestBody } from "../types/auth.types.js";
import type { Request,Response } from "express";
import { BadRequest,ConflictError,UnauthorizedError } from "../utils/error.js";
import { UserModel } from "../models/User.js";
import bcrypt from "bcrypt"
import type { ApiResponse } from "../types/apiResponse.types.js";
import type { LoginRequestBody } from "../types/auth.types.js";
import { createUserToken } from "../utils/userToken.js";
                   
                     // Registration controller

export const registerUser = async(
    //  Typed request body
    req: Request<{},{},RegisterRequestBody>,
    res: Response<ApiResponse<null>>
)=>{
        // Get registration data from request body
      const { name, email, password } = req.body;

        // Validation of required fields
       if(!name || !email || !password){
         throw new BadRequest("Must fill the required fields")
       }

        // Check duplicate email
        const existingUser  = await UserModel.findOne({email})

        // Stop the registration if the email already exists
        if(existingUser){
          throw  new ConflictError('User already exists')
        }

        //Hash password before saving it
       const hashedPassword = await bcrypt.hash(password,10)


       // Create and save the new user
       const newUser = await UserModel.create({
        name, 
        email,
        password: hashedPassword
       })

       // Registration success response
       return res.status(201).json({
        success:true,
        message:"User Registered Successfully"
       })
   }

                          // Login Controller


  export const loginUser = async (
    req:Request<{},{},LoginRequestBody>,
    res:Response<ApiResponse<null>>
  ) =>{
    const {email,password} = req.body

    const existingUser = await UserModel.findOne({email})
    if(!existingUser){ 
      throw new UnauthorizedError("User not Found")
    }

    const comparePassword = await bcrypt.compare(password,existingUser.password)

    if(!comparePassword){
      throw new UnauthorizedError("Please enter correct Password")
    }

      const token = createUserToken(existingUser)
      res.cookie("userToken",token,{
        httpOnly:true,
        sameSite: "strict",
        maxAge: 50*60*1000
      })
    

       
    return res.status(200).json({
      success:true,
      message:"Logged in Successfully"
    })

  }                      



              // Logout Controller

    export const logOutUser = (
      req:Request,
      res:Response<ApiResponse<null>>
    )=>{
       res.clearCookie("userToken")
        return res.status(200).json({
          success:true,
          message:"Logged out Successfully"
       })
    }