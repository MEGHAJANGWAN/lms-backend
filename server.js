import app from "./app.js";
import connectionToDB from "./config/dbConnection.js";
// ye jo .env file ke andr configuration hai usko consider krta hai uske basis pr cheezo ko execute krta hai
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 5000;

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "default_name",
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.listen(PORT, async () => {
  await connectionToDB();
  console.log(`App is running at http://localhost:${PORT}`);
});
