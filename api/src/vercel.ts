import dotenv from "dotenv";
dotenv.config();
import { createApp } from "./app";

// Vercel serverless entry — exports the Express app without calling listen()
export default createApp();
