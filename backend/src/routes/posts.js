import express from "express";
// import prisma from "../prismaClient.js"; // adjust path if needed

import pkg from "@prisma/client";
const { PrismaClient } = pkg;

const router = express.Router();

/**
 * @route POST /posts/create
 * @desc Create a new post (text/image/video)
 */
router.post("/create", async (req, res) => {
  try {
    const { userId, type, content, mediaUrl } = req.body;

    if (!userId || !type) {
      return res.status(400).json({ message: "userId and type are required" });
    }

    const post = await prisma.post.create({
      data: {
        userId,
        type,
        content: content || null,
        mediaUrl: mediaUrl || null,
      },
    });

    res.status(201).json({ message: "Post created successfully", post });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating post" });
  }
});

/**
 * @route GET /posts
 * @desc Get all posts
 */
router.get("/", async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      include: { user: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching posts" });
  }
});

/**
 * @route GET /posts/user/:userId
 * @desc Get posts by a specific user
 */
router.get("/user/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const posts = await prisma.post.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching user posts" });
  }
});

export default router;
