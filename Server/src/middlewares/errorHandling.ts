import type { Request,Response,NextFunction } from "express";
import { AppError } from "../utils/error.js";




export const errorHandlingMiddleware = (
     err: unknown,
     req: Request,
     res: Response,
     next: NextFunction
    )=>{
    if(err instanceof AppError){
        return res.status(err.statusCode).json({
            success: false,
            status: err.statusCode,
            message: err.message
        })
    }

    // Print the original error in the backend terminal for debugging.
    console.error("Unhandled server error:", err);

    // Send a safe message to the frontend.
    return res.status(500).json({
        success: false,
        status: 500,
        message: "Internal Server Error"
    });
}