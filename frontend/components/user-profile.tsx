"use client"

import { useState } from "react"
import Image from "next/image"
import { Grid, List, Lock } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface UserProfileProps {
  username: string
}

// Mock user data - in real app, fetch based on username
const userData = {
  username: "jane_doe",
  avatar: "/jane-avatar.png",
  bio: "Photographer | Travel enthusiast | Coffee lover",
  followers: 2345,
  following: 432,
  posts: 156,
  isPrivate: false,
  isFollowing: false,
}

const privateUserData = {
  username: "private_user",
  avatar: "/private-avatar.png",
  bio: "This account is private",
  followers: 543,
  following: 234,
  posts: 67,
  isPrivate: true,
  isFollowing: false,
}

// Mock posts
const userPosts = [
  { id: "1", image: "/other-user-post-1.png" },
  { id: "2", image: "/other-user-post-2.png" },
  { id: "3", image: "/other-user-post-3.png" },
  { id: "4", image: "/other-user-post-4.png" },
  { id: "5", image: "/other-user-post-5.png" },
  { id: "6", image: "/other-user-post-6.png" },
]

export function UserProfile({ username }: UserProfileProps) {
  // Simulate different users - in real app, fetch from API
  const user = username === "private_user" ? privateUserData : userData
  const [isFollowing, setIsFollowing] = useState(user.isFollowing)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const handleFollow = () => {
    setIsFollowing(!isFollowing)
  }

  const showPrivateMessage = user.isPrivate && !isFollowing

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="mb-8 flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        <Avatar className="h-24 w-24 sm:h-32 sm:w-32">
          <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.username} />
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
  )
}
