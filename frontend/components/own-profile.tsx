"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Settings, Grid, List } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type User = {
  id: string;
  username: string;
  name: string;
  bio?: string | null;
  followerCount: number;
  followingCount: number;
  postcount: number;
};

type Post = {
  id: string;
  mediaUrl?: string | null;
  caption?: string | null;
  postType: "TEXT" | "IMAGE" | "VIDEO";
  postedAt: string;
};

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function getToken() {
  return typeof window !== "undefined" ? localStorage.getItem("token") : null;
}

function buildAuthHeaders(): Record<string, string> {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

// lightweight decode to read exp (no lib needed)
function decodeExp(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1] || ""));
    return typeof payload?.exp === "number" ? payload.exp : null;
  } catch {
    return null;
  }
}

export function OwnProfile() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ctrl = new AbortController();

    (async () => {
      try {
        const token = getToken();
        if (!token) {
          router.replace("/login");
          return;
        }

        // hard stop if expired
        const exp = decodeExp(token);
        if (!exp || exp * 1000 <= Date.now()) {
          localStorage.removeItem("token");
          router.replace("/login");
          return;
        }

        // 1) who am I
        const meRes = await fetch(`${API}/auth/me`, {
          headers: buildAuthHeaders(),
          cache: "no-store",
          signal: ctrl.signal,
        });

        if (meRes.status === 401) {
          localStorage.removeItem("token");
          router.replace("/login");
          return;
        }
        if (!meRes.ok) throw new Error(`Failed /auth/me (${meRes.status})`);

        const me: User = await meRes.json();
        setUser(me);

        // 2) my posts
        const pRes = await fetch(`${API}/users/${me.id}/posts`, {
          headers: buildAuthHeaders(),
          cache: "no-store",
          signal: ctrl.signal,
        });

        const arr = pRes.ok ? await pRes.json() : [];
        const mapped: Post[] = Array.isArray(arr)
          ? arr.map((p: any) => ({
              id: String(p.id),
              mediaUrl: p.mediaUrl || "/placeholder.svg",
              caption: p.caption ?? null,
              postType: p.postType,
              postedAt: p.postedAt,
            }))
          : [];
        setPosts(mapped);
      } catch (err: any) {
        if (err?.name !== "AbortError") console.error(err);
      } finally {
        if (!ctrl.signal.aborted) setLoading(false);
      }
    })();

    return () => ctrl.abort();
  }, [router]);

  if (loading) return <div className="p-6">Loading…</div>;
  if (!user) return <div className="p-6">Not logged in.</div>;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="mb-8 flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        <Avatar className="h-24 w-24 sm:h-32 sm:w-32">
          <AvatarImage src={"/your-avatar.png"} alt={user.username} />
          <AvatarFallback>{user.username?.[0]?.toUpperCase() ?? "U"}</AvatarFallback>
        </Avatar>

        <div className="flex-1 text-center sm:text-left">
          <div className="mb-4 flex flex-col items-center gap-3 sm:flex-row sm:items-center">
            <h1 className="text-2xl font-semibold tracking-tight">{user.username}</h1>
            <Link href="/settings">
              <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                <Settings className="h-4 w-4" />
                Edit Profile
              </Button>
            </Link>
          </div>

          <div className="mb-4 flex justify-center gap-6 sm:justify-start">
            <div className="text-center">
              <p className="text-lg font-semibold">{posts.length}</p>
              <p className="text-sm text-muted-foreground">Posts</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold">{user.followerCount}</p>
              <p className="text-sm text-muted-foreground">Followers</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold">{user.followingCount}</p>
              <p className="text-sm text-muted-foreground">Following</p>
            </div>
          </div>

          <p className="text-sm leading-relaxed">{user.bio ?? " "}</p>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between border-t border-border pt-4">
        <h2 className="text-lg font-semibold">Posts</h2>
        <div className="flex gap-1">
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("grid")}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!posts.length ? (
        <div className="py-12 text-center text-muted-foreground">No posts yet</div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-3 gap-1 sm:gap-2">
          {posts.map((post) => (
            <div key={post.id} className="relative aspect-square overflow-hidden rounded-sm">
              <Image
                src={post.mediaUrl || "/placeholder.svg"}
                alt="Post"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id}>
              <CardContent className="p-4">
                <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                  <Image
                    src={post.mediaUrl || "/placeholder.svg"}
                    alt="Post"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
