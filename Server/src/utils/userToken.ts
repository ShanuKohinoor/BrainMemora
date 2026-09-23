import dotenv from "dotenv"
import jwt from "jsonwebtoken"
import type { User } from "../types/user.types.js"

// Load environment variables
dotenv.config()

// Check JWT secret
if(!process.env.JWT_SECRET){
    throw new Error("JWT_SECRET is not defined");
}
// Get JWT secret
const mySecret = process.env.JWT_SECRET

// Create JWT for the user
export function createUserToken(user:User){
        // Data stored inside the JWT
    const payload={
        id:user.id,
        username:user.name
    }
        // Create JWT with 50-minute expiration
    return jwt.sign(payload,mySecret,{expiresIn:"50m"})
}