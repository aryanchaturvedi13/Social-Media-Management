"use client"

import type React from "react"
import Image from "next/image"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const ABSTRACT_BG_URL = "/abstract-bg.jpg"
const DOODLES_URL = "/social-doodles.jpg"

function AbstractBG() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      <Image src={ABSTRACT_BG_URL} alt="" fill priority className="object-cover opacity-30" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.45))]" />
    </div>
  )
}

export function SignupForm() {
  const [username, setUsername] = useState("")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [accountType, setAccountType] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      alert("Passwords do not match")
      return
    }
    setLoading(true)
    setMessage("")
    try {
      const res = await fetch("http://localhost:5000/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          name,
          email,
          password,
          accountType: accountType.toUpperCase(),
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setMessage("✅ Account created successfully! Redirecting...")
        setTimeout(() => router.push("/login"), 1500)
      } else {
        setMessage(`❌ ${data.message || "Signup failed"}`)
      }
    } catch {
      setMessage("⚠️ Unable to connect to the server. Try again later.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4">
      <AbstractBG />

      <div className="w-[92vw] max-w-5xl">
        <div className="relative grid overflow-hidden rounded-[22px] bg-white shadow-2xl md:grid-cols-2">
          {/* crisp vertical divider */}
          <div className="pointer-events-none absolute inset-y-0 left-1/2 w-px bg-slate-200" />

          {/* LEFT: white form card with subtle doodles */}
          <div className="relative p-6 sm:p-10">

            <div className="mx-auto w-full max-w-md">
              <Card className="w-full border border-slate-200 bg-white shadow-sm">
                <CardHeader className="space-y-1">
                  <CardTitle className="text-2xl font-semibold tracking-tight">Create an account</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Enter your details to get started
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        type="text"
                        placeholder="Choose a username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Create a password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="account-type">Account type</Label>
                      <Select value={accountType} onValueChange={setAccountType} required>
                        <SelectTrigger id="account-type">
                          <SelectValue placeholder="Select account type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">Public / Creator</SelectItem>
                          <SelectItem value="private">Private / User</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Creating…" : "Create account"}
                    </Button>
                  </form>

                  <div className="mt-4 text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link href="/login" className="text-foreground underline underline-offset-4 hover:text-primary">
                      Sign in
                    </Link>
                  </div>

                  {message && <p className="mt-4 text-center text-sm text-foreground/80">{message}</p>}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* RIGHT: image panel (same placeholder) */}
          <div className="relative hidden min-h-[620px] md:block">
            <Image src={DOODLES_URL} alt="Abstract art" fill priority className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/10" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return <SignupForm />
}
