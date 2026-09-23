//    Base class error

       class AppError extends Error {
        statusCode:number;
        constructor(message:string,statusCode:number){
            super(message);
            this.statusCode  = statusCode;
        }
       }



 //  custom NotFoundError
    
       class NotFoundError extends AppError {
        constructor(message:string){
            super(message,404)
        }
       }

//  custom Bad request Error

      class BadRequest extends AppError{
        constructor(message:string){
            super(message,400)
        }
      }


//  custom Unauthorized error      
    class UnauthorizedError extends AppError {
        constructor(message:string) {
            super(message, 401)
        }
    }



 // conflict error
        class ConflictError extends AppError {
        constructor(message:string){
            super(message,409)
        }
       }


export {AppError,BadRequest,NotFoundError,UnauthorizedError,ConflictError}