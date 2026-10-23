import type { Request,Response } from "express"
import { UnauthorizedError,NotFoundError, BadRequest } from "../utils/error.js"
import { uploadToS3, getFileUrl, deleteFromS3 } from "../services/storageServices.js"
import { learningMaterialModel } from "../models/learningMaterials.js"


                          // UPLOAD FILE CONTROLLER

    export const uploadFile = async(
      req:Request,
      res:Response
    )=>{

        if(!req.file){
          throw new BadRequest("Please upload a file")
        }

        const fileKey = await uploadToS3(req.file)

        const fileUrl = await getFileUrl(fileKey)

        return res.status(200).json({
          success:true,
          message:"File uploaded successfully",
          data:{
            fileKey,
            fileUrl
          }
        })
    }



// Replace with new file
    export const replaceFile = async(
      req:Request,
      res:Response
    )=>{
       if(!req.userId){
        throw new UnauthorizedError("Please login first")
       }

       // Get the material id from the URL
       const {id} = req.params

       //Get userId
       const userId = req.userId

       // Find the material that belongs to logged-in user
      const material = await learningMaterialModel.findOne({
        _id : id,
        userId
      })

          // Check whether the material exists
      if(!material){
        throw new NotFoundError("Material not found")
      }

      // Check whether a new file was uploaded
      if(!req.file){
        throw new BadRequest("Please upload a file")
      }

      // Delete old file
      if(material.fileKey){
        await deleteFromS3(material.fileKey)
      }

      // Upload new file
      const newFileKey = await uploadToS3(req.file)

      // Generate a fresh URL for the new file
      const newFileUrl = await getFileUrl(newFileKey)

      // Update the material with the new file details
       material.fileKey = newFileKey;
       material.fileUrl = newFileUrl;

       // Save the updated material
       await material.save()


       // Return the updated material
        return res.status(200).json({
            success: true,
            message: "File replaced successfully",
            data: material
        })
    }

