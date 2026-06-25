import { createApp } from "./app";
// Vercel serverless entry — exports the Express app without calling listen()
// No llamamos dotenv.config() porque Vercel inyecta las variables de entorno directamente


console.log("=== DEBUG DATABASE_URL ===");
console.log("DATABASE_URL exists?", !!process.env.DATABASE_URL);
console.log("Length:", process.env.DATABASE_URL?.length || 0);

export default createApp();