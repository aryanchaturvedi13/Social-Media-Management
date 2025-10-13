import express from "express";
import cors from "cors";
import authRoutes from "./src/routes/auth.js";
import dotenv from "dotenv";
dotenv.config();

// import postRoutes from "./src/routes/posts.js";


const app = express();

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));
app.use(express.json());

// AUTHENTICATION

app.use("/auth", authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));