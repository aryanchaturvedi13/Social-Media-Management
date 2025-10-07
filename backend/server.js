import express from "express";
import cors from "cors";
import authRoutes from "./src/routes/auth.js";
// import userRoutes from "./src/routes/userRoutes.js";


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

// GET /api/users/:username
app.get("/api/users/:username", async (req, res) => {
  const { username } = req.params
  const currentUserId = req.query.currentUserId // optional: for follow status

  try {
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        bio: true,
        posts: true,       // total number of posts
        followers: true,   // total number of followers
        following: true,   // total number of following
        isPrivate: true,
      },
    })

    if (!user) return res.status(404).json({ error: "User not found" })

    // Check if current user is following this user
    let isFollowing = false
    if (currentUserId) {
      const follow = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: currentUserId,
            followingId: user.id,
          },
        },
      })
      isFollowing = !!follow
    }

    res.json({ ...user, isFollowing })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Server error" })
  }
})

// USER PROFILES
// app.use("/users", userRoutes);
