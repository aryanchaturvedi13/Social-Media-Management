import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// CREATE a post (text or media)
router.post("/create", async (req, res) => {
  try {
    const { userId, caption, mediaUrl, postType } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const post = await prisma.post.create({
      data: {
        userId: userId,
        caption: caption || "",
        mediaUrl: mediaUrl || null,
        postType: postType
      },
    });

    res.status(201).json(post);
  } catch (err) {
    console.error("Error creating post:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET all posts
router.get("/", async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(posts);
  } catch (err) {
    console.error("Error fetching posts:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET posts by a specific user
router.get("/user/:id", async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const posts = await prisma.post.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    res.json(posts);
  } catch (err) {
    console.error("Error fetching user posts:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
