"use client";
import { useEffect, useState } from "react";
import { PostCard } from "@/components/post-card";

type ApiPost = {
  id: string;
  caption?: string | null;
  mediaUrl?: string | null;
  likeCount: number;
  commentCount: number;
  postedAt: string;
  author?: { username: string };
  viewerLiked?: boolean; // <— add
};


export function HomeFeed() {
  const [posts, setPosts] = useState<ApiPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts`);
        const data: ApiPost[] = await res.json();
        setPosts(data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const mapped = posts.map(p => ({
    id: p.id,
    username: p.author?.username ?? "unknown",
    avatar: "/placeholder.svg",
    content: p.caption ?? "",
    image: p.mediaUrl ?? undefined,
    likes: p.likeCount,
    comments: p.commentCount,
    timestamp: new Date(p.postedAt).toLocaleString(),
    viewerLiked: p.viewerLiked ?? false, // <— add
  }));

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Following</h1>
      {loading ? <p className="text-sm text-muted-foreground">Loading…</p> : (
        <div className="space-y-6">
          {mapped.map((post) => <PostCard key={post.id} post={post} />)}
        </div>
      )}
    </div>
  );
}