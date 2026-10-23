                              
   import type { Request,Response } from "express"
   import { UnauthorizedError,NotFoundError, ConflictError, BadRequest } from "../utils/error.js"
   import { noteModel } from "../models/notes.js"
   import type { Note } from "../types/note.types.js"
   import type { ApiResponse } from "../types/apiResponse.types.js"
                              
                              
                              
                              //Notes
 // Create note

 export const createNote = async(
  req:Request,
  res:Response<ApiResponse<Note>>
 )=>{
      // Check whether the user is logged in
      if(!req.userId){
        throw new UnauthorizedError("Please login first")
      }

      const {title,topic,content,tags,highlights,isPinned,audioUrl} = req.body

      const userId = req.userId;

    // Check whether required fields are provided
      if(!title || !topic || !content){
        throw new BadRequest("Title,topic and content are required")
      }
      const existingNote = await noteModel.findOne({
        userId,
        title,
        topic
      })

      if(existingNote){
        throw new ConflictError("Note already exists")
      }

      const newNote = await noteModel.create({
        userId,
        title,
        topic,
        content,
        tags,
        isPinned,
        highlights,
        audioUrl
      })

  return res.status(201).json({
    success:true,
    message:"Note successfully created",
    data:newNote
  })
 }


 // Get All notes of loggedin user
 export const getAllNotes = async(
  req:Request,
  res:Response<ApiResponse<Note[]>>
 )=>{
  if(!req.userId){
    throw new UnauthorizedError("Please login first")
  }

  const userId = req.userId
  const notes = await noteModel.find({userId}).sort({updatedAt:-1})

  return res.status(200).json({
    success:true,
    message:"Notes fetched successfully",
    data:notes
  })

 }


 // Get single note

 export const getNote= async(
  req:Request,
  res:Response<ApiResponse<Note>>
 )=>{
  if(!req.userId){
    throw new UnauthorizedError("Please login first")
  }

  const userId = req.userId;
  const {id} = req.params;

  const note = await noteModel.findOne({
    _id:id,
    userId
  })

   if(!note){
    throw new NotFoundError("Note not found")
   }

  return res.status(200).json({
    success:true,
    message:"Note fetched successfully",
    data:note
  })
 }


 // Update note

 export const updateNote= async(
    req:Request<{id:string}>,
  res:Response<ApiResponse<Note>>
 )=>{
  if(!req.userId){
    throw new UnauthorizedError("Please login first")
  }

  const{title,topic,tags,content,isPinned,highlights,audioUrl}=req.body
  const userId = req.userId;
  const {id} = req.params;

    if(
      title === undefined &&
      topic === undefined &&
      content === undefined &&
      tags === undefined &&
      highlights === undefined &&
      isPinned === undefined &&
      audioUrl === undefined
    ){
      throw new BadRequest("Please provide at least one field to update")
    }


  const note = await noteModel.findOne({
    _id:id,
    userId
  })

   if(!note){
    throw new NotFoundError("Note not found")
   }

   const updatedField:Partial<Note> = {}

      if(title !== undefined){
    updatedField.title = title
   }

   if(topic !== undefined){
    updatedField.topic = topic
   }

      if(content !== undefined){
    updatedField.content = content
   }
   if(isPinned !== undefined){
    updatedField.isPinned = isPinned
   }
   if(tags !== undefined){
    updatedField.tags = tags
   }
   if(highlights !== undefined){
    updatedField.highlights = highlights
   }
   if(audioUrl !== undefined){
    updatedField.audioUrl = audioUrl
   }

 await noteModel.updateOne(
    {_id:id,userId},
    {$set: updatedField}
)

const updatedNote = await noteModel.findOne({
       _id:id,
       userId,

})

if(!updatedNote){
  throw new NotFoundError("Note not found")
}

  return res.status(200).json({
    success:true,
    message:"Note updated successfully",
    data:updatedNote
  })
 }



 // Delete note
  export const deleteNote= async(
  req:Request<{id:string}>,
  res:Response<ApiResponse<null>>
 )=>{
  if(!req.userId){
    throw new UnauthorizedError("Please login first")
  }

  const userId = req.userId;
  const {id} = req.params;

  const note = await noteModel.findOne({
    _id:id,
    userId
  })

   if(!note){
    throw new NotFoundError("Note not found")
   }


   await noteModel.deleteOne({
    _id:id,
    userId
   })

  return res.status(200).json({
    success:true,
    message:"Note deleted successfully",
    data:null
  })
 }
