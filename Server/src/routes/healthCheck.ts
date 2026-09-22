import express from "express"

const router = express.Router()

router.get("/health",(req,res)=>{
    res.json({
        success:true,
        message:"BrainMemora API is running successfully"
    })
})


export default router