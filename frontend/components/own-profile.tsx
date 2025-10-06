"use client"

import { useState } from "react"
import Image from "next/image"
import { Settings, Grid, List } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"

// Mock user data
const currentUser = {
  username: "your_username",
  avatar: "/your-avatar.png",
  bio: "Designer & Developer | Creating beautiful experiences",
  followers: 1234,
  following: 567,
  posts: 89,
}

// Mock posts
const userPosts = [
  { id: "1", image: "/user-post-1.png" },
  { id: "2", image: "/user-post-2.png" },
  { id: "3", image: "/user-post-3.png" },
  { id: "4", image: "/user-post-4.png" },
  { id: "5", image: "/user-post-5.png" },
  { id: "6", image: "/user-post-6.png" },
]

export function OwnProfile() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="mb-8 flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        <Avatar className="h-24 w-24 sm:h-32 sm:w-32">
          <AvatarImage src={currentUser.avatar || "/placeholder.svg"} alt={currentUser.username} />
          <AvatarFallback>{currentUser.username[0].toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1 text-center sm:text-left">
          <div className="mb-4 flex flex-col items-center gap-3 sm:flex-row sm:items-center">
            <h1 className="text-2xl font-semibold tracking-tight">{currentUser.username}</h1>
            <Link href="/settings">
              <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                <Settings className="h-4 w-4" />
                Edit Profile
              </Button>
            </Link>
          </div>
          <div className="mb-4 flex justify-center gap-6 sm:justify-start">
            <div className="text-center">
              <p className="text-lg font-semibold">{currentUser.posts}</p>
              <p className="text-sm text-muted-foreground">Posts</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold">{currentUser.followers}</p>
              <p className="text-sm text-muted-foreground">Followers</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold">{currentUser.following}</p>
              <p className="text-sm text-muted-foreground">Following</p>
            </div>
          </div>
          <p className="text-sm leading-relaxed">{currentUser.bio}</p>
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
    </div>
  )
}
