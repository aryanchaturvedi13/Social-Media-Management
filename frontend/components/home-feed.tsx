"use client"

import { PostCard } from "@/components/post-card"

// Mock data for following feed
const followingPosts = [
  {
    id: "1",
    username: "sarah_designs",
    avatar: "/diverse-woman-avatar.png",
    content: "Just finished a new project! Really excited about how it turned out.",
    image: "/design-project-concept.png",
    likes: 124,
    comments: 18,
    timestamp: "2h ago",
  },
  {
    id: "2",
    username: "john_dev",
    avatar: "/man-avatar.png",
    content: "Working on something cool. Can't wait to share it with you all!",
    likes: 89,
    comments: 12,
    timestamp: "5h ago",
  },
  {
    id: "3",
    username: "creative_mind",
    avatar: "/diverse-person-avatars.png",
    content: "Beautiful sunset today. Sometimes you just need to stop and appreciate the moment.",
    image: "/sunset-landscape.jpg",
    likes: 256,
    comments: 34,
    timestamp: "8h ago",
  },
]

export function HomeFeed() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Following</h1>
      <div className="space-y-6">
        {followingPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  )
}
