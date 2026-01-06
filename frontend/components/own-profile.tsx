"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Settings, Grid, List, Type } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PostCard } from "@/components/post-card";

type User = {
  id: string; username: string; name: string; bio?: string | null; avatarUrl?: string | null;
  followerCount: number; followingCount: number; postcount: number;
};

type Post = {
  id: string; mediaUrl?: string | null; caption?: string | null; postType: "TEXT"|"IMAGE"|"VIDEO";
  postedAt: string; likeCount: number; commentCount: number;
};

type LiteUser = { id: string; username: string; avatarUrl?: string | null }

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function getToken() { return typeof window !== "undefined" ? localStorage.getItem("token") : null; }
function buildAuthHeaders(): Record<string, string> { const t = getToken(); return t ? { Authorization: `Bearer ${t}` } : {}; }

function decodeExp(token: string): number | null {
  try { const payload = JSON.parse(atob(token.split(".")[1] || "")); return typeof payload?.exp === "number" ? payload.exp : null; }
  catch { return null; }
}

export function OwnProfile() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list" | "text">("grid");
  const [loading, setLoading] = useState(true);

  // Followers / Following modal state
  const [followersOpen, setFollowersOpen] = useState(false);
  const [followingOpen, setFollowingOpen] = useState(false);
  const [followers, setFollowers] = useState<LiteUser[]>([]);
  const [following, setFollowing] = useState<LiteUser[]>([]);
  const [listsLoading, setListsLoading] = useState(false);

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        const token = getToken();
        if (!token) { router.replace("/login"); return; }
        const exp = decodeExp(token);
        if (!exp || exp * 1000 <= Date.now()) { localStorage.removeItem("token"); router.replace("/login"); return; }

        const meRes = await fetch(`${API}/auth/me`, { headers: buildAuthHeaders(), cache: "no-store", signal: ctrl.signal });
        if (meRes.status === 401) { localStorage.removeItem("token"); router.replace("/login"); return; }
        if (!meRes.ok) throw new Error(`Failed /auth/me (${meRes.status})`);
        const me: User = await meRes.json();
        setUser(me);

        const pRes = await fetch(`${API}/users/${me.id}/posts`, { headers: buildAuthHeaders(), cache: "no-store", signal: ctrl.signal });
        const arr = pRes.ok ? await pRes.json() : [];
        const mapped: Post[] = Array.isArray(arr)
          ? arr.map((p: any) => ({
              id: String(p.id), mediaUrl: p.mediaUrl || null, caption: p.caption ?? null,
              postType: p.postType, postedAt: p.postedAt, likeCount: p.likeCount ?? 0, commentCount: p.commentCount ?? 0,
            }))
          : [];
        setPosts(mapped);
      } catch (err: any) {
        if (err?.name !== "AbortError") console.error(err);
      } finally { if (!ctrl.signal.aborted) setLoading(false); }
    })();
    return () => ctrl.abort();
  }, [router]);

  // Support deep-link ?post=<id> → open list view & scroll
  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    const pid = url.searchParams.get("post");
    if (!pid) return;
    if (!posts.length) return;
    setViewMode("list");
    setTimeout(() => { const el = document.getElementById(`post-${pid}`); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); }, 80);
  }, [posts]);

  async function openFollowers() {
    if (!user) return;
    setFollowersOpen(true); setFollowingOpen(false); setListsLoading(true);
    try {
      const res = await fetch(`${API}/users/${user.id}/followers`, { headers: buildAuthHeaders() });
      const data: any[] = res.ok ? await res.json() : [];
      setFollowers(data.map((u: any) => ({ id: u.id, username: u.username })));
    } finally { setListsLoading(false); }
  }
  async function openFollowing() {
    if (!user) return;
    setFollowingOpen(true); setFollowersOpen(false); setListsLoading(true);
    try {
      const res = await fetch(`${API}/users/${user.id}/following`, { headers: buildAuthHeaders() });
      const data: any[] = res.ok ? await res.json() : [];
      setFollowing(data.map((u: any) => ({ id: u.id, username: u.username })));
    } finally { setListsLoading(false); }
  }

  async function blockUser(targetId: string) {
    await fetch(`${API}/users/${targetId}/block`, { method: "POST", headers: { "Content-Type": "application/json", ...buildAuthHeaders() } });
  }
  async function unblockUser(targetId: string) {
    await fetch(`${API}/users/${targetId}/block`, { method: "DELETE", headers: { ...buildAuthHeaders() } });
  }

  if (loading) return <div className="p-6">Loading…</div>;
  if (!user) return <div className="p-6">Not logged in.</div>;

  const listSource = viewMode === "text" ? posts.filter((p) => p.postType === "TEXT") : posts;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="mb-8 flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        <Avatar className="h-24 w-24 sm:h-32 sm:w-32">
          <AvatarImage src={user.avatarUrl || "/placeholder.svg"} alt={user.username} />
          <AvatarFallback>{user.username?.[0]?.toUpperCase() ?? "U"}</AvatarFallback>
        </Avatar>

        <div className="flex-1 text-center sm:text-left">
          <div className="mb-2 flex flex-col items-center gap-1 sm:flex-row sm:items-center sm:gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">{user.username}</h1>
            <span className="text-sm text-muted-foreground">{user.name}</span>
            <Link href="/settings">
              <Button variant="outline" size="sm" className="gap-2 bg-transparent"><Settings className="h-4 w-4" /> Edit Profile</Button>
            </Link>
          </div>

          <div className="mb-4 flex justify-center gap-6 sm:justify-start">
            <div className="text-center">
              <p className="text-lg font-semibold">{posts.length}</p>
              <p className="text-sm text-muted-foreground">Posts</p>
            </div>

            <button onClick={openFollowers} className="text-center">
              <p className="text-lg font-semibold">{user.followerCount}</p>
              <p className="text-sm text-muted-foreground underline-offset-4 hover:underline">Followers</p>
            </button>

            <button onClick={openFollowing} className="text-center">
              <p className="text-lg font-semibold">{user.followingCount}</p>
              <p className="text-sm text-muted-foreground underline-offset-4 hover:underline">Following</p>
            </button>
          </div>

          <p className="text-sm leading-relaxed">{user.bio ?? " "}</p>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between border-t border-border pt-4">
        <h2 className="text-lg font-semibold">Posts</h2>
        <div className="flex gap-1">
          <Button variant={viewMode === "grid" ? "secondary" : "ghost"} size="icon" onClick={() => setViewMode("grid")}>
            <Grid className="h-4 w-4" />
          </Button>
          <Button variant={viewMode === "list" ? "secondary" : "ghost"} size="icon" onClick={() => setViewMode("list")}>
            <List className="h-4 w-4" />
          </Button>
          <Button variant={viewMode === "text" ? "secondary" : "ghost"} size="icon" onClick={() => setViewMode("text")} title="Text-only">
            <Type className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!posts.length ? (
        <div className="py-12 text-center text-muted-foreground">No posts yet</div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-3 gap-1 sm:gap-2">
          {posts.map((post) => (
            <div key={post.id} className="relative aspect-square cursor-pointer overflow-hidden rounded-sm transition hover:opacity-90"
              onClick={() => { setViewMode("list"); setTimeout(() => { const el = document.getElementById(`post-${post.id}`); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); }, 50); }}>
              <Image src={post.mediaUrl || "/placeholder.svg"} alt="Post" fill className="object-cover" unoptimized />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {listSource.map((post) => (
            <PostCard
              key={post.id}
              cardId={`post-${post.id}`}
              post={{
                id: post.id,
                username: user.username,
                avatar: user.avatarUrl || "/placeholder.svg",
                content: post.caption ?? "",
                image: post.postType === "IMAGE" ? post.mediaUrl ?? undefined : undefined,
                likes: post.likeCount,
                comments: post.commentCount,
                timestamp: new Date(post.postedAt).toLocaleString(),
                viewerLiked: false,
              }}
            />
          ))}
        </div>
      )}

      {/* Followers modal */}
      {followersOpen && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-black/50 p-6">
          <Card className="w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between border-b p-4">
              <div className="font-semibold">Followers</div>
              <Button variant="ghost" size="sm" onClick={() => setFollowersOpen(false)}>Close</Button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto p-2">
              {listsLoading ? <div className="p-4 text-sm text-muted-foreground">Loading…</div> :
                followers.length === 0 ? <div className="p-4 text-sm text-muted-foreground">No followers</div> :
                followers.map((u) => (
                  <div key={u.id} className="flex items-center justify-between gap-3 rounded-md p-3 hover:bg-secondary/50">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9"><AvatarImage src={u.avatarUrl || "/placeholder.svg"} /><AvatarFallback>{u.username?.[0]?.toUpperCase() || "U"}</AvatarFallback></Avatar>
                      <Link href={`/user/${u.username}`} className="text-sm font-medium hover:underline">{u.username}</Link>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => blockUser(u.id)}>Block</Button>
                  </div>
                ))}
            </div>
          </Card>
        </div>
      )}

      {/* Following modal */}
      {followingOpen && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-black/50 p-6">
          <Card className="w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between border-b p-4">
              <div className="font-semibold">Following</div>
              <Button variant="ghost" size="sm" onClick={() => setFollowingOpen(false)}>Close</Button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto p-2">
              {listsLoading ? <div className="p-4 text-sm text-muted-foreground">Loading…</div> :
                following.length === 0 ? <div className="p-4 text-sm text-muted-foreground">No following</div> :
                following.map((u) => (
                  <div key={u.id} className="flex items-center justify-between gap-3 rounded-md p-3 hover:bg-secondary/50">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9"><AvatarImage src={u.avatarUrl || "/placeholder.svg"} /><AvatarFallback>{u.username?.[0]?.toUpperCase() || "U"}</AvatarFallback></Avatar>
                      <Link href={`/user/${u.username}`} className="text-sm font-medium hover:underline">{u.username}</Link>
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

export default OwnProfile;
