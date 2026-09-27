import jwt from "jsonwebtoken"
import type { Request,Response,NextFunction } from "express"
import dotenv from "dotenv"
import { UnauthorizedError } from "../utils/error.js"

// Load environment variables from the .env file
dotenv.config()
if(!process.env.JWT_SECRET){
    throw new Error("JWT_SECRET is not defined")
}

const mySecret =process.env.JWT_SECRET

// Middleware to verify the logged in user's JWT token
export function verifyUser(
    req: Request,
    res:Response,
    next:NextFunction
){
    try{
        
        // Get the JWT token from the user's cookies
       const token = req.cookies?.userToken

        // Stop the request if the user is not logged in
       if(!token){
        throw new UnauthorizedError("Please login first")
       }
       // Verify that the JWT token is valid 
       const decoded = jwt.verify(token,mySecret) as {id:string}

       req.userId = decoded.id

        // Allow the request to continue
       next()
    }catch(error){
        // Pass the error to Express error-handling middleware
          return next(error)
    }
}