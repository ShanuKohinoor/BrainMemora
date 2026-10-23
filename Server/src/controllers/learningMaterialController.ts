import type { Request,Response } from "express"
import { UnauthorizedError,NotFoundError, ConflictError, BadRequest } from "../utils/error.js"
import type { LearningMaterial,CreateLearningMaterialBody } from "../types/learningMaterial.types.js"
import { learningMaterialModel } from "../models/learningMaterials.js"
import { getFileUrl, deleteFromS3 } from "../services/storageServices.js"
import type { ApiResponse } from "../types/apiResponse.types.js"



//                        LEARNING MATERIALS CONTROLLER

// Create new Learning Material
    export const createLearningMaterial = async(
        req:Request<{},{},CreateLearningMaterialBody>,
        res:Response<ApiResponse<LearningMaterial>>)=>{

          if(!req.userId){
            throw new UnauthorizedError("Please login First");
          }

          // Get required fields from the request body
          const {title,topic,type,description,fileUrl,fileKey,externalUrl,tags} = req.body

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
            type,
            // Add optional fields only if they have a value.
               // This avoids sending properties with undefined values to MongoDB.
            ...(description !== undefined && {description}),
            ...(fileUrl !== undefined && {fileUrl}),
            ...(fileKey !== undefined && {fileKey}),
            ...(externalUrl !== undefined && {externalUrl}),
            ...(tags !== undefined && {tags})


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

       // Get search, topic, and tag from query parameters.
       const search = req.query.search as string ?? ""     // if parameter is undefined or null,use " as default"
       const topic = req.query.topic as string ?? ""
       const tag = req.query.tag as string ?? ""

       // Fetch learning materials belongs to the Logged in user
        const allLearningMaterials = await learningMaterialModel.find({
          userId,
          // Add title filter only when a search value is provided
          ...(search && {title:{$regex:search , $options:"i"}}),
          // Add topic filter only when a topic value is provided
          ...(topic && {topic:{$regex:topic, $options:"i"}}),
          // Add tags filter only when a tag value is provided
          ...(tag && {tags:{$regex:tag, $options:"i"}})
        }).sort({createdAt: -1})   // Sort materials by newest first

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

          // Generate a fresh S3 URL using the permanent fileKey
          if(getMaterial.fileKey){
            getMaterial.fileUrl = await getFileUrl(getMaterial.fileKey)
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

          // Delete the file from S3
          if(material.fileKey){
            await deleteFromS3(material.fileKey)
          }

          // Delete material from MongoDB
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




// Save pin/unpin

    export const togglePinMaterial = async(
      req:Request<{id:string}>,
      res:Response<ApiResponse<LearningMaterial>>)=>{

          // Check whether the user is logged in
           if(!req.userId){
            throw new UnauthorizedError("Please login first")
           }

          // Get the logged-in user's id
           const userId = req.userId;

          // Get the material id from the URL
           const {id} = req.params

          // Find the material that belongs to the logged-in user
           const material = await learningMaterialModel.findOne({
            _id:id,
            userId
           })

          // Check whether the material exists
           if(!material){
            throw new NotFoundError("Material not found")
           }

           // Toggle the pin status:- false becomes true and true becomes false
           material.isPinned = !material.isPinned

          // Save the updated pin status
           await material.save()

         // Return the updated material
           return res.status(200).json({
            success:true,
            message: material.isPinned ? "Pinned material succcessfully" : "Material unpinned successfully",
            data:material
           })
    }







