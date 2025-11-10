"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type UserHit = {
  id: string;
  username: string;
  avatar?: string | null;
  bio?: string;
  isPrivate: boolean;
  followers: number;
  following: number;
  isFollowing?: boolean;
};

type FeedPost = {
  id: string;
  caption: string;
  postedAt: string; // ISO
  mediaUrl?: string | null;
  postType?: string | null;
  likeCount?: number;
  commentCount?: number;
  author: { id: string; username: string; avatarUrl?: string | null };
};

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const nf = new Intl.NumberFormat();

function buildAuthHeaders(): Record<string, string> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function useDebounce<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  const tRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (tRef.current) clearTimeout(tRef.current);
    tRef.current = setTimeout(() => setDebounced(value), delay);
    return () => {
      if (tRef.current) clearTimeout(tRef.current);
    };
  }, [value, delay]);
  return debounced;
}

function timeAgo(iso: string) {
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return d.toLocaleString();
}

export function ExploreFeed() {
  const [q, setQ] = useState("");
  const debouncedQ = useDebounce(q, 300);

  // mode: show USERS when query has >=2 chars, otherwise show POSTS feed
  const usersMode = debouncedQ.trim().length >= 2;

  // users state
  const [users, setUsers] = useState<UserHit[]>([]);
  const [usersNext, setUsersNext] = useState<string | null>(null);
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());

  // posts state (explore feed)
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [postsNext, setPostsNext] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  // ---------- LOAD USERS ----------
  useEffect(() => {
    if (!usersMode) return;

    let aborted = false;
    (async () => {
      setLoading(true);
      try {
        const url = new URL(`${API}/users/search`);
        url.searchParams.set("limit", "20");
        url.searchParams.set("query", debouncedQ.trim());
        const res = await fetch(url.toString(), { headers: buildAuthHeaders() });
        if (!res.ok) {
          setUsers([]);
          setUsersNext(null);
          return;
        }
        const data = await res.json();
        if (aborted) return;
        setUsers(data.items || []);
        setUsersNext(data.nextCursor ?? null);
      } finally {
        if (!aborted) setLoading(false);
      }
    })();

    return () => {
      aborted = true;
    };
  }, [usersMode, debouncedQ]);

  async function loadMoreUsers() {
    if (!usersMode || !usersNext || loading) return;
    setLoading(true);
    try {
      const url = new URL(`${API}/users/search`);
      url.searchParams.set("limit", "20");
      url.searchParams.set("query", debouncedQ.trim());
      url.searchParams.set("cursor", usersNext);
      const res = await fetch(url.toString(), { headers: buildAuthHeaders() });
      if (!res.ok) return;
      const data = await res.json();
      setUsers((p) => [...p, ...(data.items || [])]);
      setUsersNext(data.nextCursor ?? null);
    } finally {
      setLoading(false);
    }
  }

  async function follow(userId: string) {
    if (busyIds.has(userId)) return;
    const next = new Set(busyIds);
    next.add(userId);
    setBusyIds(next);
    try {
      const res = await fetch(`${API}/users/${userId}/follow`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...buildAuthHeaders() },
      });
      if (!res.ok) return;
      const data = await res.json().catch(() => ({}));
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? {
                ...u,
                isFollowing: data?.status === "REQUESTED" ? false : true,
                followers:
                  data?.status === "REQUESTED"
                    ? u.followers
                    : Math.max(0, (u.followers ?? 0) + 1),
              }
            : u
        )
      );
    } finally {
      const n = new Set(busyIds);
      n.delete(userId);
      setBusyIds(n);
    }
  }

  async function unfollow(userId: string) {
    if (busyIds.has(userId)) return;
    const next = new Set(busyIds);
    next.add(userId);
    setBusyIds(next);
    try {
      let res = await fetch(`${API}/users/${userId}/follow`, {
        method: "DELETE",
        headers: { ...buildAuthHeaders() },
      });
      if (res.status === 404 || res.status === 405) {
        res = await fetch(`${API}/users/unfollow/${userId}`, {
          method: "POST",
          headers: { ...buildAuthHeaders() },
        });
      }
      if (!res.ok) return;
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? { ...u, isFollowing: false, followers: Math.max(0, (u.followers ?? 0) - 1) }
            : u
        )
      );
    } finally {
      const n = new Set(busyIds);
      n.delete(userId);
      setBusyIds(n);
    }
  }

  // ---------- LOAD POSTS (explore feed) ----------
  useEffect(() => {
    if (usersMode) return; // searching users; don't load posts
    let aborted = false;
    (async () => {
      setLoading(true);
      try {
        const url = new URL(`${API}/posts/explore`);
        url.searchParams.set("limit", "15");
        const res = await fetch(url.toString(), { headers: buildAuthHeaders() });
        if (!res.ok) {
          setPosts([]);
          setPostsNext(null);
          return;
        }
        const data = await res.json();
        if (aborted) return;
        setPosts((data.items || []) as FeedPost[]);
        setPostsNext(data.nextCursor ?? null);
      } finally {
        if (!aborted) setLoading(false);
      }
    })();
    return () => {
      aborted = true;
    };
  }, [usersMode]);

  async function loadMorePosts() {
    if (usersMode || !postsNext || loading) return;
    setLoading(true);
    try {
      const url = new URL(`${API}/posts/explore`);
      url.searchParams.set("limit", "15");
      url.searchParams.set("cursor", postsNext);
      const res = await fetch(url.toString(), { headers: buildAuthHeaders() });
      if (!res.ok) return;
      const data = await res.json();
      setPosts((p) => [...p, ...(data.items || [])]);
      setPostsNext(data.nextCursor ?? null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-3">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search users…"
        />
        {!usersMode && (
          <p className="mt-1 text-xs text-muted-foreground">
            Tip: type at least 2 characters to search people.
          </p>
        )}
      </div>

      {/* USERS MODE */}
      {usersMode ? (
        <>
          {loading && users.length === 0 ? (
            <p className="text-sm text-muted-foreground">Searching…</p>
          ) : users.length === 0 ? (
            <p className="text-sm text-muted-foreground">No users found.</p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {users.map((u) => (
                <Card key={u.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={u.avatar || "/placeholder.svg"} />
                        <AvatarFallback>
                          {u.username?.[0]?.toUpperCase() ?? "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/user/${encodeURIComponent(u.username)}`}
                            className="font-medium hover:underline truncate"
                          >
                            {u.username}
                          </Link>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {nf.format(u.followers)} followers ·{" "}
                          {nf.format(u.following)} following
                        </div>
                        {u.bio ? (
                          <div className="mt-1 line-clamp-2 text-sm">
                            {u.bio}
                          </div>
                        ) : null}
                      </div>

                      {u.isFollowing ? (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={busyIds.has(u.id)}
                          onClick={() => unfollow(u.id)}
                        >
                          Following
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          disabled={busyIds.has(u.id)}
                          onClick={() => follow(u.id)}
                        >
                          Follow
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="mt-4 flex justify-center">
            {usersNext ? (
              <Button onClick={loadMoreUsers} disabled={loading} variant="secondary">
                {loading ? "Loading…" : "Load more"}
              </Button>
            ) : null}
          </div>
        </>
      ) : (
        // POSTS MODE — same vertical look & feel as Home
        <>
          {loading && posts.length === 0 ? (
            <p className="text-sm text-muted-foreground">Loading feed…</p>
          ) : posts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No posts yet.</p>
          ) : (
            <div className="space-y-5">
              {posts.map((p) => (
                <Card key={p.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    {/* header */}
                    <div className="mb-3 flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={p.author.avatarUrl || "/placeholder.svg"}
                        />
                        <AvatarFallback>
                          {p.author.username?.[0]?.toUpperCase() ?? "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <Link
                          href={`/user/${encodeURIComponent(p.author.username)}`}
                          className="text-sm font-medium hover:underline"
                        >
                          {p.author.username}
                        </Link>
                        <div className="text-xs text-muted-foreground">
                          {timeAgo(p.postedAt)}
                        </div>
                      </div>
                    </div>

                    {/* caption */}
                    {p.caption ? (
                      <div className="mb-3 text-sm">{p.caption}</div>
                    ) : null}

                    {/* media */}
                    {p.mediaUrl ? (
                      <div className="relative mb-3 aspect-[4/3] w-full overflow-hidden rounded-lg">
                        <Image
                          src={p.mediaUrl}
                          alt="Post"
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : null}

                    {/* actions summary (static here; wire up later if needed) */}
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>{nf.format(p.likeCount ?? 0)} likes</span>
                      <span>{nf.format(p.commentCount ?? 0)} comments</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="mt-4 flex justify-center">
            {postsNext ? (
              <Button onClick={loadMorePosts} disabled={loading} variant="secondary">
                {loading ? "Loading…" : "Load more"}
              </Button>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}
