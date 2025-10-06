"use client"

import { useState } from "react"
import Image from "next/image"
import { Heart, MessageCircle } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Post {
  id: string
  username: string
  avatar: string
  content: string
  image?: string
  likes: number
  comments: number
  timestamp: string
}

interface PostCardProps {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(post.likes)

  const handleLike = () => {
    if (isLiked) {
      setLikeCount(likeCount - 1)
    } else {
      setLikeCount(likeCount + 1)
    }
    setIsLiked(!isLiked)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={post.avatar || "/placeholder.svg"} alt={post.username} />
          <AvatarFallback>{post.username[0].toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex flex-1 flex-col">
          <p className="text-sm font-semibold leading-none">{post.username}</p>
          <p className="text-xs text-muted-foreground">{post.timestamp}</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pb-3">
        <p className="text-sm leading-relaxed">{post.content}</p>
        {post.image && (
          <div className="relative aspect-video w-full overflow-hidden rounded-lg">
            <Image src={post.image || "/placeholder.svg"} alt="Post image" fill className="object-cover" />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex items-center gap-4 pt-0">
        <Button variant="ghost" size="sm" className={cn("gap-2", isLiked && "text-red-500")} onClick={handleLike}>
          <Heart className={cn("h-5 w-5", isLiked && "fill-current")} />
          <span className="text-sm">{likeCount}</span>
        </Button>
        <Button variant="ghost" size="sm" className="gap-2">
          <MessageCircle className="h-5 w-5" />
          <span className="text-sm">{post.comments}</span>
        </Button>
      </CardFooter>
    </Card>
  )
}
