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

        res.status(500).json({
            success: false,
            status:500,
            message:"Internal Server Error"
        })
}