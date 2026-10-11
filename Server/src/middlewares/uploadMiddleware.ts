import multer from "multer"



const storage = multer.memoryStorage()


const fileFilter:multer.Options["fileFilter"] = (req,file,cb)=>{
      const allowedTypes = [
            "application/pdf",
            "image/jpeg",
            "image/png",
            "video/mp4",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "audio/mpeg",
            "audio/wav",
            "audio/ogg",
            "audio/webm",
            "audio/mp4"
      ]
      if(allowedTypes.includes(file.mimetype)){
        cb(null,true)
      }else{
          cb(new Error("Only PDF, JPG, JPEG, PNG, MP4, DOC, DOCX and audio files are allowed"))
      }

}


export const uploadMiddleware = multer({
    storage,
    fileFilter,
    limits:{
        fileSize: 100* 1024 * 1024
    }
})