import express from "express";
import multer from "multer";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { v2 as cloudinary } from "cloudinary";

const router = express.Router();
const prisma = new PrismaClient();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// Multer setup for handling uploads
const upload = multer({ dest: "uploads/" });

// ---------- CREATE POST ----------
router.post("/create", upload.single("file"), async (req, res) => {
  try {
    const { userId, type, caption, text } = req.body;
    let contentUrl = "";

    if (type === "text") {
      // For text posts, create a .txt file and upload to Cloudinary
      const filePath = path.join("uploads", `${Date.now()}.txt`);
      fs.writeFileSync(filePath, text);
      const uploadResult = await cloudinary.uploader.upload(filePath, {
        resource_type: "raw",
      });
      contentUrl = uploadResult.secure_url;
      fs.unlinkSync(filePath);
    } else {
      // For image/video uploads
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        resource_type: "auto",
      });
      contentUrl = uploadResult.secure_url;
      fs.unlinkSync(req.file.path);
    }

    const post = await prisma.post.create({
      data: {
        userId,
        type,
        contentUrl,
        caption,
      },
    });

    res.status(201).json({ success: true, post });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to create post" });
  }
});

// ---------- GET ALL POSTS ----------
router.get("/", async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch posts" });
  }
});

// ---------- GET POSTS BY USER ----------
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const posts = await prisma.post.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user posts" });
  }
});

// ---------- DELETE POST ----------
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.post.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete post" });
  }
});

export default router;
