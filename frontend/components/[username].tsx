"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import BlockButton from "@/components/block-button";
import { Card, CardContent } from "@/components/ui/card";
import { Grid, List, Lock, MessageCircle } from "lucide-react";

type ViewMode = "grid" | "list";

interface UserProfileProps {
  username: string;
}

type PostListItem = {
  id: string;
  caption?: string | null;
  postType: "TEXT" | "IMAGE" | "VIDEO";
  mediaUrl?: string | null;
  postedAt: string;
};

type FollowStatus = "NONE" | "REQUESTED" | "FOLLOWING";

type UserData = {
  id: string;
  username: string;
  name?: string | null;
  avatar?: string | null;
  bio?: string | null;
  followers?: number;
  following?: number;
  posts?: number;
  isPrivate: boolean;
  isSelf?: boolean;
  followStatus: FollowStatus;   // <= normalized
  // optional lists used by your UI (keep as-is if you have them)
  postsList?: PostListItem[];
  postsGrid?: PostListItem[];
};

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function buildAuthHeaders(): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function noCache(url: string) {
  const u = new URL(url);
  u.searchParams.set("_", String(Date.now()));
  return u.toString();
}

function nf(n?: number) {
  if (typeof n !== "number") return "0";
  try { return Intl.NumberFormat().format(n); } catch { return String(n); }
}

export default function UserProfile({ username }: UserProfileProps) {
  const [user, setUser] = useState<UserData | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  const refreshUser = useCallback(async () => {
    if (!username) return;

    const res = await fetch(
      noCache(`${API}/users/by-username/${encodeURIComponent(username)}`),
      { headers: buildAuthHeaders(), cache: "no-store" }
    );
    if (!res.ok) return;

    const raw = await res.json();

    // Normalize backend fields to our UI model
    const u: UserData = {
      id: raw.id,
      username: raw.username,
      name: raw.name,
      avatar: raw.avatarUrl ?? raw.avatar ?? null,
      bio: raw.bio,
      followers: raw.followerCount ?? raw.followers ?? 0,
      following: raw.followingCount ?? raw.following ?? 0,
      posts: raw.postcount ?? raw.posts ?? 0,
      isPrivate: raw.accountType ? raw.accountType === "PRIVATE" : !!raw.isPrivate,
      isSelf: !!raw.isSelf,
      followStatus:
        raw.followStatus === "REQUESTED" ? "REQUESTED" :
        raw.isFollowing ? "FOLLOWING" : "NONE",
      postsList: raw.postsList ?? [],
      postsGrid: raw.postsGrid ?? [],
    };

    setUser(u);
  }, [username]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const onFollow = useCallback(async () => {
    if (!user || user.isSelf || busy) return;
    setBusy(true);
    try {
      const res = await fetch(`${API}/users/${encodeURIComponent(user.id)}/follow`, {
        method: "POST",
        headers: buildAuthHeaders(),
      });

      // Robust handling: accept either HTTP 202 or JSON status
      let statusJson: any = null;
      try { statusJson = await res.json(); } catch {}

      const statusString: FollowStatus =
        statusJson?.status === "REQUESTED" || res.status === 202
          ? "REQUESTED"
          : "FOLLOWING";
        console.log("Request sent");
      // Optimistic UI:
      setUser(prev => prev ? {
        ...prev,
        followStatus: statusString,
        followers: statusString === "FOLLOWING" ? (prev.followers ?? 0) + 1 : prev.followers
      } : prev);

      // Hard refresh to sync counts/flags
      await refreshUser();
    } finally {
      setBusy(false);
    }
  }, [user, busy, refreshUser]);

  const onUnfollow = useCallback(async () => {
    if (!user || user.isSelf || busy) return;
    setBusy(true);
    try {
      const res = await fetch(`${API}/users/${encodeURIComponent(user.id)}/follow`, {
        method: "DELETE",
        headers: buildAuthHeaders(),
      });
      if (!res.ok) {
        console.error("unfollow failed", res.status);
      }

      // Optimistic UI:
      setUser(prev => prev ? {
        ...prev,
        followStatus: "NONE",
        followers: Math.max(0, (prev.followers ?? 1) - 1)
      } : prev);

      // Hard refresh to sync state from server
      await refreshUser();
    } finally {
      setBusy(false);
    }
  }, [user, busy, refreshUser]);

  if (!user) {
    return <div className="mx-auto max-w-4xl px-4 py-6">Loading…</div>;
  }

  const showPrivateWall = user.isPrivate && user.followStatus !== "FOLLOWING";
"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Grid, List, Lock } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface UserProfileProps {
  username: string
}

interface Post {
  id: string
  image: string
}

interface UserData {
  username: string
  avatar: string
  bio: string
  followers: number
  following: number
  posts: number
  isPrivate: boolean
  isFollowing: boolean
}

export function UserProfile({ username }: UserProfileProps) {
  const [user, setUser] = useState<UserData | null>(null)
  const [userPosts, setUserPosts] = useState<Post[]>([])
  const [isFollowing, setIsFollowing] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  useEffect(() => {
    if (!username) return

    // Fetch user info
    fetch(`/api/users/${username}`)
      .then(res => res.json())
      .then((data: UserData) => {
        setUser(data)
        setIsFollowing(data.isFollowing)
      })

    // Fetch user's posts
    fetch(`/api/users/${username}/posts`)
      .then(res => res.json())
      .then((posts: Post[]) => setUserPosts(posts))
  }, [username])

  const handleFollow = () => {
    // Optionally: call backend API to update follow status
    setIsFollowing(!isFollowing)
  }

  if (!user) return <div>Loading...</div>

  const showPrivateMessage = user.isPrivate && !isFollowing

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="mb-8 flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        <Avatar className="h-24 w-24 sm:h-32 sm:w-32">
          <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.username} />
          <AvatarFallback>{user.username?.[0]?.toUpperCase() ?? "U"}</AvatarFallback>
        </Avatar>

        <div className="flex-1 text-center sm:text-left">
          <div className="mb-4 flex flex-col items-center gap-3 sm:flex-row sm:items-center">
            <div className="flex flex-col items-center gap-1 sm:items-start">
              <h1 className="text-2xl font-semibold tracking-tight">{user.username}</h1>
              {user.name ? <p className="text-sm text-muted-foreground">{user.name}</p> : null}
            </div>

            {!user.isSelf && (
              <div className="flex gap-2">
                {user.followStatus === "NONE" ? (
                  <Button onClick={onFollow} disabled={busy} size="sm">
                    Follow
                  </Button>
                ) : user.followStatus === "REQUESTED" ? (
                  <Button size="sm" disabled variant="outline">
                    Requested
                  </Button>
                ) : (
                  <Button onClick={onUnfollow} disabled={busy} size="sm" variant="outline">
                    Following
                  </Button>
                )}

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => router.push(`/inbox?user=${encodeURIComponent(user.id)}`)}
                >
                  <MessageCircle className="mr-1 h-4 w-4" />
                  Message
                </Button>

                <BlockButton targetId={user.id} onToggle={() => refreshUser()} />
              </div>
            )}
          </div>

          <div className="mb-4 flex justify-center gap-6 sm:justify-start">
            <div className="text-center">
              <p className="text-lg font-semibold">{nf(user.posts)}</p>
              <p className="text-sm text-muted-foreground">Posts</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold">{nf(user.followers)}</p>
              <p className="text-sm text-muted-foreground">Followers</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold">{nf(user.following)}</p>
              <p className="text-sm text-muted-foreground">Following</p>
            </div>
          </div>

          {user.bio ? <p className="text-sm leading-relaxed">{user.bio}</p> : null}
        </div>
      </div>

      {showPrivateWall ? (
          <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1 text-center sm:text-left">
          <div className="mb-4 flex flex-col items-center gap-3 sm:flex-row sm:items-center">
            <h1 className="text-2xl font-semibold tracking-tight">{user.username}</h1>
            <Button onClick={handleFollow} variant={isFollowing ? "outline" : "default"} size="sm">
              {isFollowing ? "Following" : "Follow"}
            </Button>
          </div>
          <div className="mb-4 flex justify-center gap-6 sm:justify-start">
            <div className="text-center">
              <p className="text-lg font-semibold">{user.posts}</p>
              <p className="text-sm text-muted-foreground">Posts</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold">{user.followers}</p>
              <p className="text-sm text-muted-foreground">Followers</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold">{user.following}</p>
              <p className="text-sm text-muted-foreground">Following</p>
            </div>
          </div>
          <p className="text-sm leading-relaxed">{user.bio}</p>
        </div>
      </div>

      {showPrivateMessage ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Lock className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="mb-2 text-xl font-semibold">This account is private</h2>
          <p className="text-sm text-muted-foreground">
            {user.followStatus === "REQUESTED"
              ? "Follow request sent. Wait for approval."
              : "Follow this account to see their posts"}
          </p>
          <p className="text-sm text-muted-foreground">Follow this account to see their posts</p>
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
                aria-label="Grid"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewMode("list")}
                aria-label="List"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {viewMode === "list" ? (
            <div className="space-y-4">
              {(user.postsList ?? []).filter(p => p.postType === "TEXT").map((post) => (
                <Card key={post.id}>
                  <CardContent className="p-4">
                    <p className="text-sm">{post.caption}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {(user.postsGrid ?? []).map((post) => (
                <Card key={post.id}>
                  <CardContent className="p-4">
                    <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                      <Image src={post.mediaUrl || "/placeholder.svg"} alt="Post" fill className="object-cover" />
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
  )
}
