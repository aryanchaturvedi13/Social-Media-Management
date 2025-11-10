"use client"

import React, { useEffect, useState } from "react"
import { ArrowLeft, Send } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

// ----- Mock data -----
type ChatRow = {
  id: string
  userId: string
  username: string
  avatar: string
  lastMessage: string
  timestamp: string
  unread: boolean
}

const chats: ChatRow[] = [
  { id: "1", userId: "sarah_designs", username: "sarah_designs", avatar: "/sarah-chat-avatar.png", lastMessage: "Thanks for the feedback!", timestamp: "2m ago", unread: true },
  { id: "2", userId: "john_dev", username: "john_dev", avatar: "/john-chat-avatar.png", lastMessage: "Let's collaborate on this project", timestamp: "1h ago", unread: false },
  { id: "3", userId: "creative_mind", username: "creative_mind", avatar: "/creative-chat-avatar.png", lastMessage: "That sounds great!", timestamp: "3h ago", unread: false },
  { id: "4", userId: "tech_guru", username: "tech_guru", avatar: "/tech-chat-avatar.png", lastMessage: "Check out my latest post", timestamp: "1d ago", unread: false },
]

type Message = { id: string; text: string; sender: "me" | "other"; timestamp: string }

const chatData: Record<string, { username: string; avatar: string; messages: Message[] }> = {
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
  creative_mind: {
    username: "creative_mind",
    avatar: "/creative-chat-avatar.png",
    messages: [{ id: "1", text: "That sounds great!", sender: "other", timestamp: "3h ago" }],
  },
  tech_guru: {
    username: "tech_guru",
    avatar: "/tech-chat-avatar.png",
    messages: [{ id: "1", text: "Check out my latest post", sender: "other", timestamp: "1d ago" }],
  },
}

// ----- Page -----
export default function InboxPage() {
  // No selection initially → right side blank (desktop) / list only (mobile)
  const [selectedId, setSelectedId] = useState<string>("")
  const selectedChat = selectedId ? chatData[selectedId] : null

  const [messageInput, setMessageInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([])

  useEffect(() => {
    setMessages(selectedId ? chatData[selectedId]?.messages ?? [] : [])
  }, [selectedId])

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedId) return
    const text = messageInput.trim()
    if (!text) return
    const newMsg: Message = { id: String(messages.length + 1), text, sender: "me", timestamp: "Just now" }
    setMessages((prev) => [...prev, newMsg])
    setMessageInput("")
  }

  return (
    <div className="mx-auto h-[calc(100vh-4rem)] max-w-6xl px-4 py-6">
      <div className="grid h-full grid-cols-1 gap-4 md:grid-cols-5">
        {/* LEFT (Inbox) — visible on mobile when no chat is selected, always visible on md+ */}
        <aside className={`md:col-span-2 ${selectedId ? "hidden md:block" : "block"}`}>
          <Card className="flex h-full flex-col overflow-hidden">
            <div className="border-b p-4">
              <h1 className="text-2xl font-semibold tracking-tight">Messages</h1>
            </div>
            <div className="flex-1 divide-y overflow-y-auto">
              {chats.map((c) => {
                const isActive = selectedId === c.userId
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedId(c.userId)}
                    className={`w-full p-4 text-left transition-colors ${isActive ? "bg-secondary" : "hover:bg-secondary/50"}`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={c.avatar || "/placeholder.svg"} alt={c.username} />
                        <AvatarFallback>{c.username[0].toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 overflow-hidden">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold">{c.username}</p>
                          <p className="text-xs text-muted-foreground">{c.timestamp}</p>
                        </div>
                        <p className={`truncate text-sm ${c.unread ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                          {c.lastMessage}
                        </p>
                      </div>
                      {c.unread && <span className="h-2 w-2 rounded-full bg-accent" />}
                    </div>
                  </button>
                )
              })}
            </div>
          </Card>
        </aside>

        {/* RIGHT (Chat) — visible on mobile only when a chat is selected; always visible on md+ */}
        <section className={`md:col-span-3 ${selectedId ? "block" : "hidden md:block"}`}>
          <Card className="relative flex h-full flex-col overflow-hidden">
            {/* Wallpaper + overlay */}
            <div className="pointer-events-none absolute inset-0 bg-[url('/chatbgl1.jpeg')] bg-cover bg-center" />
            <div className="pointer-events-none absolute inset-0 bg-background/60" />

            {/* Content */}
            <div className="relative z-10 flex h-full flex-col">
              {/* Header */}
              <div className="flex items-center gap-3 border-b p-4">
                {/* Back only on mobile */}
                {selectedId && (
                  <Button className="md:hidden" variant="ghost" size="icon" onClick={() => setSelectedId("")} aria-label="Back to inbox">
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                )}
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedChat?.avatar || "/placeholder.svg"} alt={selectedChat?.username || "Chat"} />
                  <AvatarFallback>{selectedChat?.username?.[0]?.toUpperCase() || " "}</AvatarFallback>
                </Avatar>
                <h2 className="text-lg font-semibold">{selectedChat?.username || "Select a chat"}</h2>
              </div>

              {/* Messages / Placeholder */}
              <div className="flex-1 overflow-y-auto p-4">
                {selectedId ? (
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[70%] space-y-1 ${msg.sender === "me" ? "items-end" : "items-start"}`}>
                          <div
                            className={`rounded-2xl px-4 py-2 ${
                              msg.sender === "me" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                            }`}
                          >
                            <p className="text-sm leading-relaxed">{msg.text}</p>
                          </div>
                          <p className="px-2 text-xs text-muted-foreground">{msg.timestamp}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  // Blank/placeholder on first open (desktop)
                  <div className="flex h-full items-center justify-center">
                    <p className="text-sm text-muted-foreground">Select a conversation to start messaging</p>
                  </div>
                )}
              </div>

              {/* Composer */}
              <form onSubmit={handleSend} className="flex gap-2 border-t p-3">
                <Input
                  type="text"
                  placeholder={selectedId ? "Type a message..." : "Select a chat to start"}
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  className="flex-1"
                  disabled={!selectedId}
                />
                <Button type="submit" size="icon" aria-label="Send message" disabled={!selectedId}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </Card>
        </section>
      </div>
    </div>
  )
}
