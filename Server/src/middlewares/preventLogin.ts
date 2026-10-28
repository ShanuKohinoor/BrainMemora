import type{ Request,Response,NextFunction } from "express";
import jwt from "jsonwebtoken"
import dotenv from "dotenv";

dotenv.config();
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

const mySecret = process.env.JWT_SECRET;

export function preventLogin(
  req: Request,
  res: Response,
  next: NextFunction
) {
    const token = req.cookies?.userToken

    if(token){
        try{
            // check whether the existing token is valid
            jwt.verify(token,mySecret)

        // Tell the frontend that the user is already logged in
            return res.status(409).json({
                success: false,
                message: "You are already logged in"
            });

        }catch(error){
            // Invalid or expired token. Allow user to try logging in
            return next()
        }
    }
      next()

}

