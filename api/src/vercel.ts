import { createApp } from "./app";
// Vercel serverless entry — exports the Express app without calling listen()
// No llamamos dotenv.config() porque Vercel inyecta las variables de entorno directamente
export default createApp();