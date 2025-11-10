// backend/src/routes/users.js
import express from "express";
import pkg from "@prisma/client";
import { authRequired } from "../middleware/auth.js";

const { PrismaClient } = pkg;
const prisma = new PrismaClient();
const router = express.Router();

/**
 * GET /users/by-username/:username
 * Public profile shell + viewer flags (isFollowing, isSelf)
 */
router.get("/by-username/:username", async (req, res) => {
  try {
    const viewerId = req.user?.id || null;

    const u = await prisma.user.findUnique({
      where: { username: req.params.username },
      select: {
        id: true,
        username: true,
        bio: true,
        followerCount: true,
        followingCount: true,
        postcount: true,
        accountType: true,
        createdAt: true,
      },
    });
    if (!u) return res.status(404).json({ message: "User not found" });

    let isFollowing = false;
    if (viewerId) {
      const f = await prisma.follows.findUnique({
        where: {
          followerId_followingId: { followerId: viewerId, followingId: u.id },
        },
      });
      isFollowing = !!f;
    }

    res.json({
      id: u.id,
      username: u.username,
      bio: u.bio || "",
      // no avatar column in your schema => send null; frontend will show placeholder
      avatar: null,
      followers: u.followerCount ?? 0,
      following: u.followingCount ?? 0,
      posts: u.postcount ?? 0,
      isPrivate: u.accountType === "PRIVATE",
      isFollowing,
      isSelf: viewerId === u.id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load profile" });
  }
});

/**
 * GET /users/:id/posts
 * Respects privacy (PRIVATE requires follower or self)
 */
router.get("/:id/posts", async (req, res) => {
  try {
    const targetId = req.params.id;
    const viewerId = req.user?.id || null;

    const target = await prisma.user.findUnique({
      where: { id: targetId },
      select: { accountType: true },
    });
    if (!target) return res.status(404).json({ message: "User not found" });

    if (target.accountType === "PRIVATE" && viewerId !== targetId) {
      const f = await prisma.follows.findUnique({
        where: {
          followerId_followingId: {
            followerId: viewerId || "",
            followingId: targetId,
          },
        },
      });
      if (!f) return res.status(403).json({ message: "Private account" });
    }

    const posts = await prisma.post.findMany({
      where: { userId: targetId },
      orderBy: { postedAt: "desc" },
      select: {
        id: true,
        caption: true,
        mediaUrl: true,
        postType: true,
        postedAt: true,
        author: { select: { username: true } },
      },
    });
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load posts" });
  }
});

/**
 * POST /users/:id/follow
 * Public -> follow now; Private -> create follow request
 */
router.post("/:id/follow", authRequired, async (req, res) => {
  try {
    const me = req.user.id;
    const targetId = req.params.id;
    if (me === targetId)
      return res.status(400).json({ message: "Cannot follow yourself" });

    const target = await prisma.user.findUnique({
      where: { id: targetId },
      select: { accountType: true },
    });
    if (!target) return res.status(404).json({ message: "User not found" });

    const already = await prisma.follows.findUnique({
      where: {
        followerId_followingId: { followerId: me, followingId: targetId },
      },
    });
    if (already) return res.json({ status: "FOLLOWING" });

    if (target.accountType === "PRIVATE") {
      const exists = await prisma.followRequest.findUnique({
        where: {
          requesterId_targetId: { requesterId: me, targetId },
        },
      });
      if (exists) return res.json({ status: "REQUESTED" });

      await prisma.followRequest.create({
        data: { requesterId: me, targetId },
      });
      return res.json({ status: "REQUESTED" });
    }

    await prisma.$transaction([
      prisma.follows.create({
        data: { followerId: me, followingId: targetId },
      }),
      prisma.user.update({
        where: { id: targetId },
        data: { followerCount: { increment: 1 } },
      }),
      prisma.user.update({
        where: { id: me },
        data: { followingCount: { increment: 1 } },
      }),
    ]);

    res.json({ status: "FOLLOWING" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Follow failed" });
  }
});

/**
 * DELETE /users/:id/follow
 * POST /users/unfollow/:id  (alias)
 */
router.delete("/:id/follow", authRequired, async (req, res) => {
  try {
    const me = req.user.id;
    const targetId = req.params.id;

    await prisma.$transaction([
      prisma.follows.deleteMany({
        where: { followerId: me, followingId: targetId },
      }),
      prisma.user.update({
        where: { id: targetId },
        data: { followerCount: { decrement: 1 } },
      }),
      prisma.user.update({
        where: { id: me },
        data: { followingCount: { decrement: 1 } },
      }),
    ]);

    res.json({ status: "UNFOLLOWED" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Unfollow failed" });
  }
});

router.post("/unfollow/:id", authRequired, async (req, res) => {
  try {
    const me = req.user.id;
    const targetId = req.params.id;

    await prisma.$transaction([
      prisma.follows.deleteMany({
        where: { followerId: me, followingId: targetId },
      }),
      prisma.user.update({
        where: { id: targetId },
        data: { followerCount: { decrement: 1 } },
      }),
      prisma.user.update({
        where: { id: me },
        data: { followingCount: { decrement: 1 } },
      }),
    ]);

    res.json({ status: "UNFOLLOWED" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Unfollow failed" });
  }
});

/**
 * GET /users/me/follow-requests
 */
router.get("/me/follow-requests", authRequired, async (req, res) => {
  try {
    const rows = await prisma.followRequest.findMany({
      where: { targetId: req.user.id, status: "PENDING" },
      orderBy: { createdAt: "desc" },
      select: {
        requesterId: true,
        createdAt: true,
        requester: { select: { id: true, username: true } },
      },
    });
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load follow requests" });
  }
});

/**
 * POST /users/follow-requests/:requesterId/approve|reject
 */
router.post(
  "/follow-requests/:requesterId/approve",
  authRequired,
  async (req, res) => {
    try {
      const targetId = req.user.id;
      const requesterId = req.params.requesterId;

      await prisma.$transaction([
        prisma.follows.create({
          data: { followerId: requesterId, followingId: targetId },
        }),
        prisma.user.update({
          where: { id: targetId },
          data: { followerCount: { increment: 1 } },
        }),
        prisma.user.update({
          where: { id: requesterId },
          data: { followingCount: { increment: 1 } },
        }),
        prisma.followRequest.delete({
          where: {
            requesterId_targetId: { requesterId, targetId },
          },
        }),
      ]);

      res.json({ status: "APPROVED" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Approve failed" });
    }
  }
);

router.post(
  "/follow-requests/:requesterId/reject",
  authRequired,
  async (req, res) => {
    try {
      const targetId = req.user.id;
      const requesterId = req.params.requesterId;
      await prisma.followRequest.deleteMany({
        where: { requesterId, targetId },
      });
      res.json({ status: "REJECTED" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Reject failed" });
    }
  }
);

/**
 * GET /users/:id/followers
 * GET /users/:id/following
 */
router.get("/:id/followers", async (req, res) => {
  try {
    const targetId = req.params.id;
    const viewerId = req.user?.id || null;

    const target = await prisma.user.findUnique({
      where: { id: targetId },
      select: { accountType: true },
    });
    if (!target) return res.status(404).json({ message: "User not found" });

    if (target.accountType === "PRIVATE" && viewerId !== targetId) {
      const f = await prisma.follows.findUnique({
        where: {
          followerId_followingId: {
            followerId: viewerId || "",
            followingId: targetId,
          },
        },
      });
      if (!f) return res.status(403).json({ message: "Private account" });
    }

    const rows = await prisma.follows.findMany({
      where: { followingId: targetId },
      include: { follower: { select: { id: true, username: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(rows.map((r) => r.follower));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load followers" });
  }
});

router.get("/:id/following", async (req, res) => {
  try {
    const targetId = req.params.id;
    const viewerId = req.user?.id || null;

    const target = await prisma.user.findUnique({
      where: { id: targetId },
      select: { accountType: true },
    });
    if (!target) return res.status(404).json({ message: "User not found" });

    if (target.accountType === "PRIVATE" && viewerId !== targetId) {
      const f = await prisma.follows.findUnique({
        where: {
          followerId_followingId: {
            followerId: viewerId || "",
            followingId: targetId,
          },
        },
      });
      if (!f) return res.status(403).json({ message: "Private account" });
    }

    const rows = await prisma.follows.findMany({
      where: { followerId: targetId },
      include: { following: { select: { id: true, username: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(rows.map((r) => r.following));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load following" });
  }
});

/**
 * GET /users/search?query=<q>&limit=20&cursor=<userId>
 * No `mode: "insensitive"` and no avatar fields (your schema doesn’t have them).
 * Case-insensitive behavior depends on DB collation.
 */
router.get("/search", async (req, res) => {
  try {
    const viewerId = req.user?.id || null; // set by app.use(authOptional)
    const q = String(req.query.q || req.query.query || "").trim();
    const take = Math.min(50, Number(req.query.limit) || 20);
    const cursorId = req.query.cursor ? String(req.query.cursor) : null;

    let where = {};
    if (q) {
      where = {
        OR: [
          { username: { contains: q } },
          { bio: { contains: q } },
        ],
      };
    }

    const rows = await prisma.user.findMany({
      where,
      select: {
        id: true,
        username: true,
        bio: true,
        accountType: true,
        followerCount: true,
        followingCount: true,
        createdAt: true,
      },
      orderBy: q ? [{ username: "asc" }] : [{ createdAt: "desc" }],
      take: take + 1,
      ...(cursorId ? { skip: 1, cursor: { id: cursorId } } : {}),
    });

    const hasMore = rows.length > take;
    const page = rows.slice(0, take);

    let followingSet = new Set();
    if (viewerId && page.length) {
      const ids = page.map((r) => r.id);
      const follows = await prisma.follows.findMany({
        where: { followerId: viewerId, followingId: { in: ids } },
        select: { followingId: true },
      });
      followingSet = new Set(follows.map((f) => f.followingId));
    }

    const items = page.map((r) => ({
      id: r.id,
      username: r.username,
      bio: r.bio || "",
      avatar: null, // no avatar column in your schema
      isPrivate: r.accountType === "PRIVATE",
      followers: r.followerCount || 0,
      following: r.followingCount || 0,
      isFollowing: viewerId ? followingSet.has(r.id) : false,
    }));

    res.json({ items, nextCursor: hasMore ? rows[rows.length - 1].id : null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Search failed" });
  }
});

export default router;
