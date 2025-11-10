"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Grid, List, Lock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type ViewMode = "grid" | "list";

interface UserProfileProps {
  username: string;
}

interface Post {
  id: string;
  image: string;
}

interface UserData {
  id: string;
  username: string;
  avatar?: string;
  bio?: string;
  followers: number;
  following: number;
  posts: number;
  isPrivate: boolean;
  isFollowing?: boolean;
  followStatus?: "NONE" | "REQUESTED" | "FOLLOWING";
}

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const nf = new Intl.NumberFormat();

function buildAuthHeaders(): Record<string, string> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function UserProfile({ username }: UserProfileProps) {
  const [user, setUser] = useState<UserData | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const refreshUser = useCallback(async () => {
    if (!username) return;

    const res = await fetch(
      `${API}/users/by-username/${encodeURIComponent(username)}`,
      { headers: buildAuthHeaders() } // no memo – always fresh token
    );
    if (!res.ok) return;

    const raw = await res.json();

    // normalize server fields -> client shape
    const u: UserData = {
      id: raw.id,
      username: raw.username,
      avatar: raw.avatar,
      bio: raw.bio,
      followers: raw.followers ?? raw.followerCount ?? 0,
      following: raw.following ?? raw.followingCount ?? 0,
      posts: raw.posts ?? raw.postcount ?? 0,
      isPrivate: raw.isPrivate ?? (raw.accountType === "PRIVATE"),
      isFollowing: !!raw.isFollowing,
      followStatus: raw.followStatus,
    };

    setUser(u);

    const following =
      !!u.isFollowing || u.followStatus === "FOLLOWING";
    setIsFollowing(following);
    setRequestSent(u.followStatus === "REQUESTED");

    if (!u.isPrivate || following) {
      const pRes = await fetch(`${API}/users/${u.id}/posts`, {
        headers: buildAuthHeaders(),
      });
      if (pRes.ok) {
        const posts = (await pRes.json()).map((p: any) => ({
          id: String(p.id),
          image: p.mediaUrl || "/placeholder.svg",
        })) as Post[];
        setUserPosts(posts);
      } else {
        setUserPosts([]);
      }
    } else {
      setUserPosts([]);
    }
  }, [username]);

  useEffect(() => {
    (async () => {
      await refreshUser();
    })();
  }, [refreshUser]);

  const follow = useCallback(async () => {
    if (!user || busy) return;
    setBusy(true);
    try {
      const res = await fetch(`${API}/users/${user.id}/follow`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...buildAuthHeaders() },
      });

      if (res.status === 401) {
        alert("Session expired. Please log in again.");
        return;
      }
      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        console.error("FOLLOW failed:", res.status, msg);
        return;
      }

      const data = await res.json().catch(() => ({}));
      if (data?.status === "REQUESTED") {
        setRequestSent(true);
      } else {
        // assume FOLLOWING when success and not explicitly REQUESTED
        setIsFollowing(true);
        setRequestSent(false);
        setUser((prev) =>
          prev ? { ...prev, followers: Math.max(0, (prev.followers ?? 0) + 1) } : prev
        );
      }

      await refreshUser();
    } finally {
      setBusy(false);
    }
  }, [user, busy, refreshUser]);

  const unfollow = useCallback(async () => {
    if (!user || busy) return;
    setBusy(true);
    try {
      // Try DELETE /users/:id/follow first
      let res = await fetch(`${API}/users/${user.id}/follow`, {
        method: "DELETE",
        headers: { ...buildAuthHeaders() },
      });

      // Fallback to server’s route: /users/unfollow/:id
      if (res.status === 404 || res.status === 405) {
        res = await fetch(`${API}/users/unfollow/${user.id}`, {
          method: "POST",
          headers: { ...buildAuthHeaders() },
        });
      }

      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        console.error("UNFOLLOW failed:", res.status, msg);
        return;
      }

      setIsFollowing(false);
      setRequestSent(false);
      setUser((prev) =>
        prev ? { ...prev, followers: Math.max(0, (prev.followers ?? 0) - 1) } : prev
      );

      await refreshUser();
    } finally {
      setBusy(false);
    }
  }, [user, busy, refreshUser]);

  if (!user) return <div className="px-4 py-6">Loading…</div>;

  const showPrivateMessage = user.isPrivate && !isFollowing;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="mb-8 flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        <Avatar className="h-24 w-24 sm:h-32 sm:w-32">
          <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.username} />
          <AvatarFallback>{user.username?.[0]?.toUpperCase() ?? "U"}</AvatarFallback>
        </Avatar>

        <div className="flex-1 text-center sm:text-left">
          <div className="mb-4 flex flex-col items-center gap-3 sm:flex-row sm:items-center">
            <h1 className="text-2xl font-semibold tracking-tight">{user.username}</h1>

            {!isFollowing ? (
              <Button onClick={follow} disabled={busy || requestSent} size="sm">
                {requestSent ? "Requested" : "Follow"}
              </Button>
            ) : (
              <Button onClick={unfollow} disabled={busy} size="sm" variant="outline">
                Following
              </Button>
            )}
          </div>

          <div className="mb-4 flex justify-center gap-6 sm:justify-start">
            <div className="text-center">
              <p className="text-lg font-semibold">{nf.format(user.posts ?? 0)}</p>
              <p className="text-sm text-muted-foreground">Posts</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold">{nf.format(user.followers ?? 0)}</p>
              <p className="text-sm text-muted-foreground">Followers</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold">{nf.format(user.following ?? 0)}</p>
              <p className="text-sm text-muted-foreground">Following</p>
            </div>
          </div>

          {user.bio ? <p className="text-sm leading-relaxed">{user.bio}</p> : null}
        </div>
      </div>

      {showPrivateMessage ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Lock className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="mb-2 text-xl font-semibold">This account is private</h2>
          <p className="text-sm text-muted-foreground">
            {requestSent ? "Follow request sent. Wait for approval." : "Follow this account to see their posts"}
          </p>
        </div>
      ) : (
        <>
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

          {viewMode === "grid" ? (
            <div className="grid grid-cols-3 gap-1 sm:gap-2">
              {userPosts.map((post) => (
                <div key={post.id} className="relative aspect-square overflow-hidden rounded-sm">
                  <Image src={post.image || "/placeholder.svg"} alt="Post" fill className="object-cover" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {userPosts.map((post) => (
                <Card key={post.id}>
                  <CardContent className="p-4">
                    <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                      <Image src={post.image || "/placeholder.svg"} alt="Post" fill className="object-cover" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
