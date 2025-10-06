"use client"

import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"

// Mock chat data
const chats = [
  {
    id: "1",
    userId: "sarah_designs",
    username: "sarah_designs",
    avatar: "/sarah-chat-avatar.png",
    lastMessage: "Thanks for the feedback!",
    timestamp: "2m ago",
    unread: true,
  },
  {
    id: "2",
    userId: "john_dev",
    username: "john_dev",
    avatar: "/john-chat-avatar.png",
    lastMessage: "Let's collaborate on this project",
    timestamp: "1h ago",
    unread: false,
  },
  {
    id: "3",
    userId: "creative_mind",
    username: "creative_mind",
    avatar: "/creative-chat-avatar.png",
    lastMessage: "That sounds great!",
    timestamp: "3h ago",
    unread: false,
  },
  {
    id: "4",
    userId: "tech_guru",
    username: "tech_guru",
    avatar: "/tech-chat-avatar.png",
    lastMessage: "Check out my latest post",
    timestamp: "1d ago",
    unread: false,
  },
]

export function InboxList() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Messages</h1>
      <div className="space-y-2">
        {chats.map((chat) => (
          <Link key={chat.id} href={`/chat/${chat.userId}`}>
            <Card className="transition-colors hover:bg-secondary/50">
              <div className="flex items-center gap-3 p-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={chat.avatar || "/placeholder.svg"} alt={chat.username} />
                  <AvatarFallback>{chat.username[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{chat.username}</p>
                    <p className="text-xs text-muted-foreground">{chat.timestamp}</p>
                  </div>
                  <p
                    className={`truncate text-sm ${chat.unread ? "font-medium text-foreground" : "text-muted-foreground"}`}
                  >
                    {chat.lastMessage}
                  </p>
                </div>
                {chat.unread && <div className="h-2 w-2 rounded-full bg-accent" />}
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
