// Add custom types globally
declare global {

    // Access Express types
    namespace Express {

        // Extend the Request type
        interface Request {

            // Store the logged in user's ID
            userId?: string
        }
    }
}

export {}