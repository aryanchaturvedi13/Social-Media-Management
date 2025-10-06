"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { User, Lock, Shield, LogOut } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function SettingsForm() {
  const router = useRouter()
  const [username, setUsername] = useState("your_username")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [accountType, setAccountType] = useState("public")

  const handleUpdateUsername = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] Updating username:", username)
    // Handle username update logic
  }

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      alert("New passwords do not match")
      return
    }
    console.log("[v0] Updating password")
    // Handle password update logic
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
  }

  const handleUpdateAccountType = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] Updating account type:", accountType)
    // Handle account type update logic
  }

  const handleLogout = () => {
    console.log("[v0] Logging out")
    // Handle logout logic
    router.push("/login")
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Settings</h1>

      <div className="space-y-6">
        {/* Username Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <CardTitle>Username</CardTitle>
            </div>
            <CardDescription>Update your username</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateUsername} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter new username"
                />
              </div>
              <Button type="submit">Update Username</Button>
            </form>
          </CardContent>
        </Card>

        {/* Password Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              <CardTitle>Password</CardTitle>
            </div>
            <CardDescription>Change your password</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-new-password">Confirm New Password</Label>
                <Input
                  id="confirm-new-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
              </div>
              <Button type="submit">Update Password</Button>
            </form>
          </CardContent>
        </Card>

        {/* Account Type Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <CardTitle>Account Privacy</CardTitle>
            </div>
            <CardDescription>Control who can see your content</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateAccountType} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="account-type">Account Type</Label>
                <Select value={accountType} onValueChange={setAccountType}>
                  <SelectTrigger id="account-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public / Creator</SelectItem>
                    <SelectItem value="private">Private / User</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {accountType === "public"
                    ? "Your posts are visible to everyone"
                    : "Only your followers can see your posts"}
                </p>
              </div>
              <Button type="submit">Update Privacy</Button>
            </form>
          </CardContent>
        </Card>

        {/* Logout Section */}
        <Card className="border-destructive/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <LogOut className="h-5 w-5 text-destructive" />
              <CardTitle className="text-destructive">Logout</CardTitle>
            </div>
            <CardDescription>Sign out from this device</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={handleLogout} className="w-full sm:w-auto">
              Logout from this device
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
