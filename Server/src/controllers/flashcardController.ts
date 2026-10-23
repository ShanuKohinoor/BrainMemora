import type { Request,Response } from "express"
import { BadRequest, NotFoundError, UnauthorizedError } from "../utils/error.js"
import { flashcardModel } from "../models/flashcard.js";
import { learningMaterialModel } from "../models/learningMaterials.js";
import { noteModel } from "../models/notes.js";


export const createFlashcard =  async(
    req:Request,
    res:Response)=>{

        
         if(!req.userId) {
           throw new UnauthorizedError("Please login first")
         }

         const {topic,title,sources,question,answer} = req.body;
         const userId = req.userId

                 console.log("Flashcardroute reached",userId);

        // Check whether at least one source exists
         if(!Array.isArray(sources) || sources.length === 0){
            throw new BadRequest("Atleast one source is required")
         }

         // Check each source one at a time
          for(const source of sources){
            // Check wheteher the source type is valid
            if(source.sourceType !== "note" && source.sourceType !== "learningMaterial"){
             throw new BadRequest("Invalid source type")
            }

             // Check whether note exist & belongs to this user
            if(source.sourceType === "note"){
                const note = await noteModel.findOne({
                    _id:source.sourceId,
                    userId
                })
                if(!note){
                    throw new NotFoundError("Note not found")
                }
            }

            // Check whether learning materials exist & belongs to this user
            if(source.sourceType === "learningMaterial"){
                const learningMaterial = await learningMaterialModel.findOne({
                    _id:source.sourceId,
                    userId
                })
                if(!learningMaterial){
                    throw new NotFoundError("Material not found")
                }
            }


          }

          // Create new Flashcard
         const newFlashcard = await flashcardModel.create({
            userId,
            topic,
            title,
            sources,
            question,
            answer
         })

        res.status(201).json({
           success: true,
           message: "Flashcard created successfully",
           data: newFlashcard
        })
}



// To view all flashcards
export const getAllFlashCards = async(
    req:Request,
    res:Response
)=>{
    if(!req.userId){
        throw new UnauthorizedError("Please login first")
    }
    
    const userId = req.userId;
    // const id = req.params
    const flashcard = await flashcardModel.find({
        userId,
    })


        res.status(200).json({
            success:true,
            message:"Fetched all Flashcard successfully",
            data: flashcard
        })
}



// To get one Flashcard
export const getOneFlashCard = async(
    req:Request<{id:string}>,
    res:Response
)=>{
     if(!req.userId){
        throw new UnauthorizedError("Please login first")
     }

     const userId  = req.userId
     const {id} = req.params

     const flashcard = await flashcardModel.findOne({
        _id:id,
        userId
     })


     if(!flashcard){
        throw new NotFoundError("Flashcard not found")
     }

     res.status(200).json({
        success:true,
        message:"Fetched flashcard successfully",
        data: flashcard
     })
}


// Update Flashcard
export const updateFlashCard =async(
    req:Request<{id:string}>,
    res:Response
)=>{

      if(!req.userId){
        throw new UnauthorizedError("Please login first")
      }

      const {topic,title,sources,question,answer} = req.body;

      const userId = req.userId;
      const {id} = req.params

    //   Find flashcard
      const updateFlashcard = await flashcardModel.findOneAndUpdate(
        {_id:id,userId},
        {topic,title,sources,question,answer},
        {new:true,runValidators:true}
      )

      // Check for the existence
     if(!updateFlashcard){
        throw new NotFoundError("Flashcard not found")
     }


         res.status(200).json({
        success:true,
        message:"Flashcard  updated successfully",
        data: updateFlashcard
     })

}

// To delete flashcard
export const deleteFlashCard = async(
    req:Request<{id:string}>,
    res:Response
)=>{
      if(!req.userId){
        throw new UnauthorizedError("Please login first")
      }

      const userId = req.userId;
      const {id} = req.params

    //   Find flashcard
      const flashcard = await flashcardModel.findOne({
        _id:id,
        userId
      })

      // Check for the existence
     if(!flashcard){
        throw new NotFoundError("Flashcard not found")
     }
      
     // Delete flashcard
      await flashcardModel.deleteOne({
        _id:id,
        userId
      })


      res.status(200).json({
        success:true,
        message:"Flashcard deleted successfully",
        data:null
      })
}