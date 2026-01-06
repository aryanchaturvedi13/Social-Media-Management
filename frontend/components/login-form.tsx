"use client"

import type React from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

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

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // login logic is here
    try {
      const res = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, username }),
      })
      const data = await res.json()
      if (res.ok) {
        localStorage.setItem("token", data.token)
        setMessage("✅ Login successful! Redirecting...")
        setTimeout(() => router.push("/home"), 1200)
      } else {
        setMessage(`❌ ${data.message || "Login failed"}`)
      }
    } catch (err) {
      console.error(err)
      setMessage("⚠️ Unable to connect to the server. Try again later.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4">
      <AbstractBG />

      {/* Centered & wider frame */}
      <div className="w-[92vw] max-w-5xl"> {/* wider: up to ~1120px */}
        <div className="relative grid overflow-hidden rounded-[22px] bg-white shadow-2xl md:grid-cols-2">
          {/* crisp vertical divider (fixes color seam) */}
          <div className="pointer-events-none absolute inset-y-0 left-1/2 w-px bg-slate-200" />

          {/* LEFT: white card */}
          <div className="relative p-6 sm:p-10">
            <div className="mx-auto w-full max-w-md">
              <Card className="w-full border border-slate-200 bg-white shadow-sm">
                <CardHeader className="space-y-1">
                  <CardTitle className="text-2xl font-semibold tracking-tight">Pulse</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Sign in to your account to continue
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="text"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        type="text"
                        placeholder="Enter your username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Signing in…" : "Sign in"}
                    </Button>
                  </form>
          setMessage("✅ Login successful! Redirecting...");
          console.log("Logged In");
          setTimeout(() => router.push('/home'), 100);
        } else {
          setMessage(`❌ ${data.message || "Login failed"}`);
          console.log("Login failed");
        }
      } catch (error) {
        console.error(error);
        setMessage("⚠️ Unable to connect to the server. Try again later.");
      }

                  <div className="mt-4 text-center text-sm text-muted-foreground">
                    {"Don't have an account? "}
                    <Link href="/signup" className="text-foreground underline underline-offset-4 hover:text-primary">
                      Sign up
                    </Link>
                  </div>

                  {message && <p className="mt-4 text-center text-sm text-foreground/80">{message}</p>}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* RIGHT: image panel */}
          <div className="relative hidden min-h-[620px] md:block">
            <Image
              src={DOODLES_URL}
              alt="Abstract art"
              fill
              priority
              className="object-cover"
            />
            {/* slight inner vignette for depth */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/10" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return <LoginForm />
}
