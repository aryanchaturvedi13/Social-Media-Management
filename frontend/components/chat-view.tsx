"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Send } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

interface ChatViewProps {
  userId: string
}

// Mock chat data
const chatData: Record<string, any> = {
  sarah_designs: {
    username: "sarah_designs",
    avatar: "/sarah-chat-avatar.png",
    messages: [
      { id: "1", text: "Hey! I saw your latest design work", sender: "other", timestamp: "10:30 AM" },
      { id: "2", text: "Thanks! I really appreciate it", sender: "me", timestamp: "10:32 AM" },
      { id: "3", text: "Would love to get your feedback on my new project", sender: "other", timestamp: "10:35 AM" },
      { id: "4", text: "Of course! Send it over", sender: "me", timestamp: "10:36 AM" },
      { id: "5", text: "Thanks for the feedback!", sender: "other", timestamp: "10:45 AM" },
    ],
  },
  john_dev: {
    username: "john_dev",
    avatar: "/john-chat-avatar.png",
    messages: [
      { id: "1", text: "Hi! Are you available for a collaboration?", sender: "other", timestamp: "Yesterday" },
      { id: "2", text: "What did you have in mind?", sender: "me", timestamp: "Yesterday" },
      { id: "3", text: "Let's collaborate on this project", sender: "other", timestamp: "1h ago" },
    ],
  },
}

export function ChatView({ userId }: ChatViewProps) {
  const chat = chatData[userId] || { username: userId, avatar: "/placeholder.svg", messages: [] }
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState(chat.messages)

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    const newMessage = {
      id: String(messages.length + 1),
      text: message,
      sender: "me",
      timestamp: "Just now",
    }
    setMessages([...messages, newMessage])
    setMessage("")
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-2xl flex-col px-4 py-6">
      <div className="mb-4 flex items-center gap-3">
        <Link href="/inbox">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <Avatar className="h-10 w-10">
          <AvatarImage src={chat.avatar || "/placeholder.svg"} alt={chat.username} />
          <AvatarFallback>{chat.username[0].toUpperCase()}</AvatarFallback>
        </Avatar>
        <h1 className="text-lg font-semibold">{chat.username}</h1>
      </div>

      <Card className="mb-4 flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[70%] space-y-1 ${msg.sender === "me" ? "items-end" : "items-start"}`}>
                <div
                  className={`rounded-2xl px-4 py-2 ${
                    msg.sender === "me"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                </div>
                <p className="px-2 text-xs text-muted-foreground">{msg.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <form onSubmit={handleSend} className="flex gap-2">
        <Input
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" size="icon">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  )
}
