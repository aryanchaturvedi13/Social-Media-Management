import express from "express";
import prisma from "../prisma/server.js"; // your prisma client import

const router = express.Router();

// Get user by username
router.get("/:username", async (req, res) => {
  const { username } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id : true,
        username: true,
        email: true,
        name: true,
        bio: true,
        followerCount : true,
        followingCount : true,
        createdAt: true,
      },
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
