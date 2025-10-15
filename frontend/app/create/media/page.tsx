import PostMediaCreator from "@/components/post-media-creator"

export default function MediaCreatePage() {
  return (
    <main className="container mx-auto max-w-3xl p-4">
      <h1 className="mb-4 text-2xl font-semibold text-pretty">Create Media Post</h1>
      <PostMediaCreator />
    </main>
  )
}