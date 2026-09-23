// Data required for user registration
export interface RegisterRequestBody {
    name: string;
    email:string;
    password : string
}


// Data required for user Login
export interface LoginRequestBody {
    email:string;
    password:string
}