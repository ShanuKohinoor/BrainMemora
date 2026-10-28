import type{ Request,Response,NextFunction } from "express";


const preventCache = (
    req:Request,
    res:Response,
    next:NextFunction
)=>{
    res.set("Cache-Control","no-store")
    next()
}

export default  preventCache
