

import type { Request,Response } from "express"
import { UserModel } from "../models/user.js"
import { UnauthorizedError,NotFoundError, ConflictError } from "../utils/error.js"
import type { ApiResponse } from "../types/apiResponse.types.js"
import type { User } from "../types/user.types.js"


//Get profile
    export const getProfile = async (
        req:Request,
        res:Response<ApiResponse<User>>
    )=>{
            if (!req.userId) {
              throw new UnauthorizedError("Please login first")
            }

          const id = req.userId

          const user = await UserModel.findById(id).select("-password")
            if (!user) {
                throw new NotFoundError("User not found")
            }


          return res.status(200).json({
            success:true,
            message:"Profile fetched successfully",
            data: user

          })
    }



    //Update profile

    export const updateProfile = async (
        req: Request,
        res: Response<ApiResponse<User>>
    ) => {
        // Check if the user is logged in
        if (!req.userId) {
            throw new UnauthorizedError("Please login first")
        }

        // Get updated profile data
        const { name, email } = req.body

        // Get logged-in user's ID
        const id = req.userId

        // Find the user
         const user = await UserModel.findById(id).select("-password");
        // Check if user exists
        if (!user) {
            throw new NotFoundError("User not found")
        }


        // Update user details
        if(name !== undefined){
            user.name = name
        }
        if(email !== undefined){

            // Check for duplicate email
            const existingEmail = await UserModel.findOne({email})

            if(existingEmail && existingEmail.id !== req.userId){
            throw new ConflictError("User already exist")
            }

            user.email = email
        }

        // Save updated user
        await user.save()

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data:user
        })
    }


