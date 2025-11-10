import express from "express";
import { PrismaClient } from "@prisma/client";
import { authRequired } from "../middleware/auth.js";

const router = express.Router();
const prisma = new PrismaClient();

// CREATE a post (text or media)
router.post("/create", async (req, res) => {
  try {
    const { userId, caption, mediaUrl, postType } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

   const [post] = await prisma.$transaction([
   prisma.post.create({ data: { userId, caption, mediaUrl, postType } }),
   prisma.user.update({ where: { id: userId }, data: { postcount: { increment: 1 } } }),
   ]);

    res.status(201).json(post);
  } catch (err) {
    console.error("Error creating post:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

async function markViewerLiked(prisma, viewerId, posts) {
  if (!viewerId || posts.length === 0) return new Set();
  const ids = posts.map(p => p.id);
  const liked = await prisma.like.findMany({
    where: { userId: viewerId, postId: { in: ids } },
    select: { postId: true },
  });
  return new Set(liked.map(l => l.postId));
}


// GET all posts
router.get("/", async (req, res) => {
  try {
    const viewerId = req.user?.id || null;

    const rows = await prisma.post.findMany({
      orderBy: { postedAt: "desc" },
      select: {
        id: true,
        caption: true,
        mediaUrl: true,
        postType: true,
        postedAt: true,
        likeCount: true,
        commentCount: true,
        author: { select: { username: true } },
      },
    });

    const likedSet = await markViewerLiked(prisma, viewerId, rows);
    const posts = rows.map(p => ({ ...p, viewerLiked: likedSet.has(p.id) }));

    res.json(posts);
  } catch (err) {
    console.error("Error fetching posts:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// GET posts by a specific user
router.get("/user/:id", async (req, res) => {
  try {
    const userId = req.params.id; // cuid string
    const posts = await prisma.post.findMany({
      where: { userId },
      orderBy: { postedAt: "desc" },
    });
    res.json(posts);
  } catch (err) {
    console.error("Error fetching user posts:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET /posts/explore?limit=20&cursor=<postId>
// Returns latest posts from PUBLIC accounts (no follow required).
router.get("/explore", async (req, res) => {
  try {
    const take = Math.min(50, Number(req.query.limit) || 20);
    const cursorId = req.query.cursor ? String(req.query.cursor) : null;

    const rows = await prisma.post.findMany({
      where: {
        author: { accountType: "PUBLIC" }, // only public users
      },
      orderBy: { postedAt: "desc" },
      take: take + 1,
      ...(cursorId ? { skip: 1, cursor: { id: cursorId } } : {}),
      select: {
        id: true,
        mediaUrl: true,
        caption: true,
        postedAt: true,
        author: { select: { id: true, username: true } },
      },
    });

    const hasMore = rows.length > take;
    const items = rows.slice(0, take).map((p) => ({
      id: p.id,
      mediaUrl: p.mediaUrl,
      caption: p.caption || "",
      postedAt: p.postedAt,
      author: p.author,
    }));

    res.json({ items, nextCursor: hasMore ? rows[rows.length - 1].id : null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Explore feed failed" });
  }
});

// LIKE a post
router.post("/:id/like", authRequired, async (req, res) => {
  const postId = req.params.id;
  const userId = req.user.id;

  try {
    await prisma.$transaction(async (tx) => {
      try {
        await tx.like.create({ data: { postId, userId } });
        await tx.post.update({
          where: { id: postId },
          data: { likeCount: { increment: 1 } },
        });
      } catch (e) {
        // P2002 = Unique constraint failed => user already liked this post
        if (e?.code !== "P2002") throw e;
        // no-op: don't increment likeCount
      }
    });

    const { likeCount } = await prisma.post.findUnique({
      where: { id: postId },
      select: { likeCount: true },
    });
    res.json({ liked: true, likeCount });
  } catch (err) {
    console.error("LIKE failed:", err);
    res.status(500).json({ message: "Like failed" });
  }
});


// UNLIKE a post
router.delete("/:id/like", authRequired, async (req, res) => {
  const postId = req.params.id;
  const userId = req.user.id;

  try {
    await prisma.$transaction(async (tx) => {
      const del = await tx.like.deleteMany({ where: { userId, postId } });
      if (del.count > 0) {
        await tx.post.update({
          where: { id: postId },
          data: { likeCount: { decrement: 1 } },
        });
      }
    });

    const { likeCount } = await prisma.post.findUnique({
      where: { id: postId },
      select: { likeCount: true },
    });
    res.json({ liked: false, likeCount });
  } catch (err) {
    console.error("UNLIKE failed:", err);
    res.status(500).json({ message: "Unlike failed" });
  }
});



// GET /posts/:id/comments?limit=20&cursor=<commentId>
// Returns top-level comments with ONE tier of replies, both with author username.
router.get("/:id/comments", async (req, res) => {
  try {
    const postId = req.params.id;
    const take = Math.min(50, Number(req.query.limit) || 20);
    const cursor = req.query.cursor ? String(req.query.cursor) : null;

    const items = await prisma.comment.findMany({
      where: { postId, parentCommentId: null },
      orderBy: { createdAt: "asc" },
      take: take + 1,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      select: {
        id: true,
        content: true,
        createdAt: true,
        parentCommentId: true,
        author: { select: { id: true, username: true } },
        replies: {
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            content: true,
            createdAt: true,
            parentCommentId: true,
            author: { select: { id: true, username: true } },
          },
        },
      },
    });

    const hasMore = items.length > take;
    res.json({ items: items.slice(0, take), nextCursor: hasMore ? items[items.length - 1].id : null });
  } catch (err) {
    console.error("Load comments failed:", err);
    res.status(500).json({ message: "Load comments failed" });
  }
});

// POST /posts/:id/comments
// Body: { content: string, parentCommentId?: string }
// If parentCommentId is provided, it must be a TOP-LEVEL comment (enforce 1-tier).
router.post("/:id/comments", authRequired, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;
    const content = String(req.body?.content || "").trim();
    const parentCommentId = req.body?.parentCommentId ? String(req.body.parentCommentId) : null;

    if (!content) return res.status(400).json({ message: "Empty comment" });

    if (parentCommentId) {
      const parent = await prisma.comment.findUnique({
        where: { id: parentCommentId },
        select: { id: true, postId: true, parentCommentId: true },
      });
      if (!parent || parent.postId !== postId) {
        return res.status(400).json({ message: "Invalid parentCommentId" });
      }
      if (parent.parentCommentId) {
        return res.status(400).json({ message: "Replies are allowed only one level deep" });
      }
    }

    const [comment] = await prisma.$transaction([
      prisma.comment.create({ data: { postId, userId, content, parentCommentId } }),
      prisma.post.update({ where: { id: postId }, data: { commentCount: { increment: 1 } } }),
    ]);

    // return with author username so UI can render immediately
    const withAuthor = await prisma.comment.findUnique({
      where: { id: comment.id },
      select: {
        id: true,
        content: true,
        createdAt: true,
        parentCommentId: true,
        author: { select: { id: true, username: true } },
      },
    });

    res.status(201).json(withAuthor);
  } catch (err) {
    console.error("Add comment failed:", err);
    res.status(500).json({ message: "Add comment failed" });
  }
});


export default router;