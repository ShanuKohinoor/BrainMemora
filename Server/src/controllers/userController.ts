

import type { Request,Response } from "express"
import { UserModel } from "../models/User.js"
import { UnauthorizedError,NotFoundError, ConflictError, BadRequest } from "../utils/error.js"
import type { ApiResponse } from "../types/apiResponse.types.js"
import type { User } from "../types/user.types.js"
import type { LearningMaterial,CreateLearningMaterialBody } from "../types/learningMaterial.types.js"
import { learningMaterialModel } from "../models/LearningMaterials.js"



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
    const user = await UserModel.findById(id)

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


//                        Learning Material controllers

// Create new Learning Material
 export const createLearningMaterial = async(
    req:Request<{},{},CreateLearningMaterialBody>,
    res:Response<ApiResponse<LearningMaterial>>)=>{

      if(!req.userId){
        throw new UnauthorizedError("Please login First");  
      }

      // Get required fields from the request body
      const {title,topic,type,description,fileUrl,externalUrl,tags} = req.body

      // Check whether required fields are provided
      if(!title || !topic || !type){
        throw new BadRequest("Please enter proper fields")
      }
        //Get logged in users ID
      const userId = req.userId

      // Check whether the same user already has a material with the same title, topic and type 
      const existingLearningMaterial = await learningMaterialModel.findOne({userId,title,topic,type})
      if(existingLearningMaterial){
        throw new ConflictError("Material with this title already exists")
      }

      //Create and save new material
       const newLearningMaterial = await learningMaterialModel.create({
        userId,
        title,
        topic,
        type
       })

        //Return newly created material
        return res.status(200).json({
           success:true,
           message:"Created Learning Material Successfully",
           data: newLearningMaterial
        })
    }



// To fetch all learning material

export const getAllLearningMaterial = async(
  req:Request,
  res:Response<ApiResponse<LearningMaterial[]>>
)=>{
        // Check whether the user is logged in
       if(!req.userId){
        throw new UnauthorizedError("Please Login First")
       }

       // Get the logged in user's ID
       const userId  = req.userId
       //Find all materials belongs to this user
       const allLearningMaterials = await learningMaterialModel.find({userId})

       // Return all materials  If there are no materials, data will be an empty array []    
        return res.status(200).json({
        success:true,
        message: allLearningMaterials.length === 0 ?
                  "No learning materials found,Please create one":
                  "Succefully fetched learning materials",
        data: allLearningMaterials
       })
}



// Get one learning material

export const getOneMaterial = async(
  req:Request<{id:string}>,
  res:Response<ApiResponse<LearningMaterial>>
)=>{
      // Check whether the user is logged in
     if(!req.userId){
       throw new UnauthorizedError("Please login first")
     }
       // Get the logged in user's id
      const userId = req.userId

      // Get the material id from the URL
      const {id} = req.params
      //Find materail with this material id of this user
      const getMaterial = await learningMaterialModel.findOne({
        _id:id,
        userId})
      // Check for existance of the material
      if(!getMaterial){
        throw new NotFoundError("Learning Material not found")
      }
     // Return that particular material
     return res.status(200).json({
      success:true,
      message:"Material fetched succesfully",
      data:getMaterial
     })
}





// Update learning material
export const updateMaterial = async(
  req:Request<{id:string}>,
  res:Response<ApiResponse<LearningMaterial>>)=>{
     // Check whether the user is logged in
     if(!req.userId){
      throw new UnauthorizedError("Please login first")
     }

     // Get the fields the user wants to update
     const {title,topic,type} = req.body

     // Make sure at least one field is provided
     if(title === undefined && topic === undefined && type === undefined){
      throw new BadRequest("Please provide atleast one field  to update")
     }

       // Get the logged in user's id
     const userId = req.userId
     
       // Get the material id from the URL
     const {id} = req.params

     // Check whether the material exists and belongs to the logged-in user
     const material = await learningMaterialModel.findOne({
      _id:id,
      userId
     })
     // If the material doesnot exists or belongs to the another user
     if(!material){
      throw new NotFoundError("Material not found")
     }

     // Create an object for the fields that need to be updated
     const updateFields:Partial<LearningMaterial>={}

     // Add title only if the user provided it
     if(title !== undefined){
      updateFields.title = title
     }

     // Add topic only if the user provided it
     if(topic !== undefined){
      updateFields.topic = topic
     }

     // Add type only if the user provided it
     if(type !== undefined){
      updateFields.type = type
     }


     // Update the learning material in the MongoDB
     await learningMaterialModel.updateOne(
      {
      _id: id,
      userId
     },
     {
      $set:updateFields
     }
    ) 

    // Get updated field
    const updatedMaterial = await learningMaterialModel.findOne({
      _id:id,
      userId
    })

    // Check whether the updated material exists
    if(!updatedMaterial){
      throw new NotFoundError("Material not found")
    }

    // Return the updated material
     return res.status(200).json({
      success:true,
      message:"Learning material updated successfully",
      data: updatedMaterial
     })
}




// Delete material controller

export const deleteMaterial = async(
  req:Request<{id:string}>,
  res:Response<ApiResponse<null>>
)=>{
  // Check whether the user is logged in
  if(!req.userId){
    throw new UnauthorizedError("Please login first")
  }

  // Get the logged in user's ID
  const userId = req.userId
  // Get material id from URL
  const {id} = req.params

  // Get material with logged in user
  const material = await learningMaterialModel.findOne({
    _id:id,
    userId
  })
  // Check for the material is available
  if(!material){
    throw new NotFoundError("Material not found")
  }

  // Delete material
  await learningMaterialModel.deleteOne({
    _id:id,
    userId
  })

  // Return status
  return res.status(200).json({
    success:true,
    message:"Material deleted successfully",
    data:null
  })
}