import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/dbConnection.js";
import userRouter from "./routes/User.js";
import characterRouter from "./routes/Character.js";
import messageRouter from "./routes/Message.js";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

// 1. Initialize App & Config
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// 2. Setup __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 3. Connect to Database
connectDB();

// 4. Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 5. Updated CORS Configuration
// Replace 'https://your-frontend.onrender.com' with your actual frontend URL
app.use(
  cors({
    origin: [
      "http://localhost:5173", 
      "https://knox-frontend.vercel.app" // Your actual Vercel URL from the error logs
    ],
    credentials: true, // Allows cookies/sessions to pass between Vercel and Render
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 7. Routes
app.use("/api/auth", userRouter);
app.use("/api/character", characterRouter);
app.use("/api/chat", messageRouter);

// Root Health Check
app.get("/", (req, res) => {
  res.json({ message: "Server is running properly" });
});

// 8. Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
