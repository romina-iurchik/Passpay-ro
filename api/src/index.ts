import dotenv from "dotenv";
dotenv.config();
import { createApp } from "./app";
const PORT = process.env.PORT || 3001;

const app = createApp();

app.listen(PORT, () => {
  console.log(`🚀 Passpay API running on port ${PORT}`);
  console.log("=== DEBUG DATABASE_URL ===");
  console.log("DATABASE_URL exists?", !!process.env.DATABASE_URL);
  console.log("Length:", process.env.DATABASE_URL?.length || 0);
});