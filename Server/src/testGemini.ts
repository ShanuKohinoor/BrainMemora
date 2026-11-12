import "dotenv/config";
import { generateGeminiText } from "./services/geminiService.js";



const result = await generateGeminiText(
    "i want recipie for chicken biriyani"

)

console.log(result);
