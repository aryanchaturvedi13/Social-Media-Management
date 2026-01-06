"use client";

import { useEffect, useState } from "react";
import { PostCard } from "@/components/post-card";

type FeedPost = {
  id: string;
  caption: string;
  postedAt: string;
  mediaUrl?: string | null;
  postType?: "TEXT" | "IMAGE" | "VIDEO" | null;
  likeCount?: number;
  commentCount?: number;
  viewerLiked?: boolean;
  author: { id: string; username: string; avatarUrl?: string | null };
};

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function buildAuthHeaders(): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}
function timeAgo(iso: string) {
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return d.toLocaleString();
}

export default function HomeFeed() {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let aborted = false;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API}/posts`, { headers: buildAuthHeaders() });
        if (!res.ok) { setPosts([]); return; }
        const data = await res.json();
        if (aborted) return;
        setPosts(Array.isArray(data) ? data : []);
      } finally {
        if (!aborted) setLoading(false);
      }
    })();
    return () => { aborted = true; };
  }, []);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      {loading && posts.length === 0 ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : posts.length === 0 ? (
        <p className="text-sm text-muted-foreground">No posts yet.</p>
      ) : (
        <div className="space-y-5">
          {posts.map((p) => (
            <PostCard
              key={p.id}
              post={{
                id: p.id,
                username: p.author.username,
                avatar: p.author.avatarUrl || "/placeholder.svg",
                content: p.caption || "",
                image: p.postType === "IMAGE" ? p.mediaUrl ?? undefined : undefined,
                likes: p.likeCount ?? 0,
                comments: p.commentCount ?? 0,
                timestamp: timeAgo(p.postedAt),
                viewerLiked: !!p.viewerLiked,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
