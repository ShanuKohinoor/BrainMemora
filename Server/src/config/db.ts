import mongoose from "mongoose";
import dotenv from "dotenv"

dotenv.config()



if(!process.env.MONGO_URI){
    throw new Error("MONGO_URI is not defined")
}

const connectDB = async()=>{
    try{
        await mongoose.connect(process.env.MONGO_URI as string)
        console.log(("MongoDB connected successfully"));
        
    }catch(error){
        console.log("MongoDB connection failed",error);
        
    }
}


export default connectDB