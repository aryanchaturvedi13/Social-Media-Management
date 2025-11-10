"use client"

import { useState } from "react"
import Image from "next/image"
import { Heart, MessageCircle, X, CornerDownRight } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

function getToken() {
  return typeof window !== "undefined" ? localStorage.getItem("token") : null
}
function buildAuthHeaders(): Record<string, string> {
  const t = getToken()
  return t ? { Authorization: `Bearer ${t}` } : {}
}

interface Author { id: string; username: string }
interface CommentItem {
  id: string
  content: string
  createdAt: string
  parentCommentId?: string | null
  author: Author
  replies?: CommentItem[]
}

interface Post {
  id: string
  username: string
  avatar: string
  content: string
  image?: string
  likes: number
  comments: number
  timestamp: string
  viewerLiked?: boolean
}

interface PostCardProps { post: Post }

export function PostCard({ post }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(!!post.viewerLiked)
  const [likeCount, setLikeCount] = useState(post.likes)
  const [commentCount, setCommentCount] = useState(post.comments)

  const [showComments, setShowComments] = useState(false)
  const [loadingComments, setLoadingComments] = useState(false)
  const [comments, setComments] = useState<CommentItem[]>([])
  const [newComment, setNewComment] = useState("")
  const [replyFor, setReplyFor] = useState<string | null>(null)
  const [replyText, setReplyText] = useState("")

  // dummy like toggle (wire to API if/when ready)
  const handleLike = () => {
    setIsLiked((v) => !v)
    setLikeCount((c) => c + (isLiked ? -1 : 1))
  }

  async function loadComments() {
    setLoadingComments(true)
    try {
      const res = await fetch(`${API}/posts/${post.id}/comments`)
      const data = await res.json()
      setComments(Array.isArray(data.items) ? data.items : [])
    } finally {
      setLoadingComments(false)
    }
  }

  const openComments = async () => {
    setShowComments(true)
    if (comments.length === 0) await loadComments()
  }

  async function submitTopLevel(e: React.FormEvent) {
    e.preventDefault()
    const text = newComment.trim()
    if (!text) return
    if (!getToken()) { alert("Please login to comment"); return }
    const res = await fetch(`${API}/posts/${post.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...buildAuthHeaders() },
      body: JSON.stringify({ content: text }),
    })
    if (!res.ok) return
    const c = await res.json()
    setComments((prev) => [...prev, { ...c, replies: [] }])
    setNewComment("")
    setCommentCount((x) => x + 1)
  }

  async function submitReply(e: React.FormEvent) {
    e.preventDefault()
    const text = replyText.trim()
    if (!text || !replyFor) return
    if (!getToken()) { alert("Please login to comment"); return }
    const res = await fetch(`${API}/posts/${post.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...buildAuthHeaders() },
      body: JSON.stringify({ content: text, parentCommentId: replyFor }),
    })
    if (!res.ok) return
    const c = await res.json()
    setComments((prev) =>
      prev.map((top) =>
        top.id === replyFor
          ? { ...top, replies: [...(top.replies || []), c] }
          : top
      )
    )
    setReplyText("")
    setReplyFor(null)
    setCommentCount((x) => x + 1)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={post.avatar || "/placeholder.svg"} alt={post.username} />
          <AvatarFallback>{post.username[0].toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex flex-1 flex-col">
          <Link href={`/user/${post.username}`} className="text-sm font-semibold leading-none hover:underline">
            {post.username}
          </Link>
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

        <Button variant="ghost" size="sm" className="gap-2" onClick={openComments}>
          <MessageCircle className="h-5 w-5" />
          <span className="text-sm">{commentCount}</span>
        </Button>
      </CardFooter>

      {/* Comments Overlay */}
      {showComments && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-6">
          <div className="max-h-[90vh] w-full max-w-lg overflow-hidden rounded-t-2xl bg-card shadow-xl sm:rounded-2xl">
            <div className="flex items-center justify-between border-b p-4">
              <div className="font-semibold">Comments</div>
              <Button variant="ghost" size="icon" onClick={() => setShowComments(false)} aria-label="Close">
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="h-[50vh] space-y-4 overflow-y-auto p-4 sm:h-[60vh]">
              {loadingComments ? (
                <div className="text-sm text-muted-foreground">Loading…</div>
              ) : comments.length === 0 ? (
                <div className="text-sm text-muted-foreground">Be the first to comment</div>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="space-y-2">
                    {/* top-level */}
                    <div className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={"/placeholder.svg"} />
                        <AvatarFallback>{c.author.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm">
                          <span className="font-medium">{c.author.username}</span>{" "}
                          <span className="text-muted-foreground">{new Date(c.createdAt).toLocaleString()}</span>
                        </div>
                        <div className="break-words text-sm leading-relaxed">{c.content}</div>
                        <div className="mt-1">
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => {
                            setReplyFor(c.id)
                            setReplyText("")
                          }}>
                            <CornerDownRight className="mr-1 h-4 w-4" /> Reply
                          </Button>
                        </div>
                        {/* replies (one tier) */}
                        {(c.replies || []).map((r) => (
                          <div key={r.id} className="mt-3 flex gap-3 border-l pl-3">
                            <Avatar className="h-7 w-7">
                              <AvatarImage src={"/placeholder.svg"} />
                              <AvatarFallback>{r.author.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs">
                                <span className="font-medium">{r.author.username}</span>{" "}
                                <span className="text-muted-foreground">{new Date(r.createdAt).toLocaleString()}</span>
                              </div>
                              <div className="break-words text-sm leading-relaxed">{r.content}</div>
                            </div>
                          </div>
                        ))}
                        {/* reply box (shown only for selected top-level) */}
                        {replyFor === c.id && (
                          <form onSubmit={submitReply} className="mt-2 flex items-center gap-2">
                            <Input
                              placeholder={`Reply to ${c.author.username}…`}
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                            />
                            <Button type="submit" size="sm">Reply</Button>
                          </form>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* top-level composer */}
            <form onSubmit={submitTopLevel} className="flex items-center gap-2 border-t p-3">
              <Input
                placeholder="Write a comment…"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <Button type="submit">Post</Button>
            </form>
          </div>
        </div>
      )}
    </Card>
  )
}
