import { redirect } from "next/navigation"

export default function HomePage() {
  // Redirect to home feed by default
  redirect("/login")
}
