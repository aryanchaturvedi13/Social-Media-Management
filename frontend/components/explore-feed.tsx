"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { PostCard } from "@/components/post-card"

// Mock data for explore feed
const explorePosts = [
  {
    id: "4",
    username: "travel_enthusiast",
    avatar: "/traveler-avatar.png",
    content: "Exploring the mountains. Nature is the best therapy.",
    image: "/majestic-mountain-vista.png",
    likes: 432,
    comments: 56,
    timestamp: "1h ago",
  },
  {
    id: "5",
    username: "food_lover",
    avatar: "/chef-avatar.png",
    content: "Made this delicious pasta from scratch. Recipe in comments!",
    image: "/delicious-pasta-dish.png",
    likes: 678,
    comments: 92,
    timestamp: "3h ago",
  },
  {
    id: "6",
    username: "tech_guru",
    avatar: "/tech-person-avatar.png",
    content: "Just launched my new app! Check it out and let me know what you think.",
    likes: 234,
    comments: 45,
    timestamp: "6h ago",
  },
  {
    id: "7",
    username: "fitness_coach",
    avatar: "/fitness-avatar.jpg",
    content: "Morning workout complete! Remember, consistency is key.",
    image: "/gym-workout.png",
    likes: 189,
    comments: 23,
    timestamp: "9h ago",
  },
]

export function ExploreFeed() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-6 space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Explore</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
      <div className="space-y-6">
        {explorePosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  )
}
