import PostTextCreator from "@/components/post-text-creator"
import { Navigation } from "@/components/navigation"

export default function TextCreatePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navigation/>
      <main className="container mx-auto max-w-3xl p-4">
        <h1 className="mb-4 text-2xl font-semibold text-pretty">Create Text Post</h1>
        <PostTextCreator />
      </main>
    </div>
  )
}