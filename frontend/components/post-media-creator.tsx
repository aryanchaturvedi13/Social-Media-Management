"use client"

import type React from "react"
import { useCallback, useEffect, useRef, useState } from "react"
import ReactCrop, { centerCrop, makeAspectCrop, type Crop, type PixelCrop } from "react-image-crop"
import "react-image-crop/dist/ReactCrop.css"
import { jwtDecode } from "jwt-decode"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
// We need to import the crop library
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  type Crop,
  type PixelCrop,
} from "react-image-crop"
// Import the library's CSS
import "react-image-crop/dist/ReactCrop.css"
import { jwtDecode } from "jwt-decode"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

type MediaState = { file?: File; url?: string; isImage: boolean }

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number): Crop {
  return centerCrop(makeAspectCrop({ unit: "%", width: 90 }, aspect, mediaWidth, mediaHeight), mediaWidth, mediaHeight)
}

export default function PostMediaCreator() {
  const router = useRouter()
  const { toast } = useToast()
  const [state, setState] = useState<MediaState>({ isImage: true })
  const [caption, setCaption] = useState("")
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const [posting, setPosting] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const url = state.url
    return () => { if (url) URL.revokeObjectURL(url) }
import { decode } from "punycode"

// Types
type MediaState = {
  file?: File
  url?: string
  isImage: boolean
}

// Helper to center the crop
function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number
): Crop {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  )
}

export default function PostMediaCreator() {
  const { toast } = useToast()
  const [state, setState] = useState<MediaState>({
    isImage: true,
  })
  const [caption, setCaption] = useState("")
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const imgRef = useRef<HTMLImageElement>(null)

  // Revoke objectURL on unmount or file change
  useEffect(() => {
    const url = state.url
    return () => {
      if (url) URL.revokeObjectURL(url)
    }
  }, [state.url])

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (state.url) URL.revokeObjectURL(state.url)
    const url = URL.createObjectURL(file)
    setState({ file, url, isImage: file.type.startsWith("image/") })
    setCaption("")
    setCrop(undefined)
    setCompletedCrop(undefined)
  }

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget
    setCrop(centerAspectCrop(width, height, 1 / 1))
  }

const exportImageCanvas = useCallback(async (): Promise<Blob | null> => {
  const image = imgRef.current
  if (!image || !completedCrop?.width || !completedCrop?.height) {
    return state.file ?? null
  }

  const canvas = document.createElement("canvas")
  const pixelRatio = window.devicePixelRatio || 1

  // ✅ canvas size = crop size * device pixel ratio (no scaleX/scaleY)
  canvas.width = Math.floor(completedCrop.width * pixelRatio)
  canvas.height = Math.floor(completedCrop.height * pixelRatio)

  const ctx = canvas.getContext("2d")
  if (!ctx) return null

  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
  ctx.imageSmoothingQuality = "high"

  const scaleX = image.naturalWidth / image.width
  const scaleY = image.naturalHeight / image.height

  const sx = completedCrop.x * scaleX
  const sy = completedCrop.y * scaleY
  const sw = completedCrop.width * scaleX
  const sh = completedCrop.height * scaleY

  // ✅ draw exactly into the full canvas
  ctx.drawImage(image, sx, sy, sw, sh, 0, 0, completedCrop.width, completedCrop.height)

  return await new Promise<Blob | null>((resolve) =>
    canvas.toBlob((b) => resolve(b), "image/jpeg", 0.9),
  )
}, [completedCrop, state.file])


  async function uploadToCloudinary(file: File) {
    const data = new FormData()
    data.append("file", file)
    data.append("upload_preset", "unsigned_post_upload")
    const res = await fetch("https://api.cloudinary.com/v1_1/duqral7bw/auto/upload", { method: "POST", body: data })
    const result = await res.json()
    return result.secure_url as string
  }

  const handlePost = async () => {
    if (!state.file) {
      toast({ title: "No media selected", description: "Please choose an image or video to post." })
      return
    }

    let userId: string | number
    try {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("No token")
      const decoded: { userId: string | number } = jwtDecode(token)
      userId = decoded.userId
    } catch {
      toast({ title: "Not Authenticated", description: "You must be logged in to post. Please log in again.", variant: "destructive" })
      return
    }

    try {
      setPosting(true)
      let fileToUpload: File | Blob
      if (state.isImage) {
        const blob = await exportImageCanvas()
        if (!blob) throw new Error("Image export failed")
        fileToUpload = new File([blob], state.file.name, { type: (blob as Blob).type })
      } else {
        fileToUpload = state.file
      }
      const uploadedUrl = await uploadToCloudinary(fileToUpload as File)

      const res = await fetch("http://localhost:5000/posts/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          caption,
          mediaUrl: uploadedUrl,
          postType: state.isImage ? "IMAGE" : "VIDEO",
        }),
      })
      const post = await res.json()

      toast({ title: "Posted!", description: "Your post has been uploaded successfully." })
      setPosting(false)
      router.push(`/profile?post=${encodeURIComponent(post.id)}`)
    } catch (err) {
      console.error(err)
      setPosting(false)
      toast({ title: "Upload failed", description: "Something went wrong while posting.", variant: "destructive" })

    if (state.url) URL.revokeObjectURL(state.url)
    const url = URL.createObjectURL(file)
    const isImage = file.type.startsWith("image/")

    setState({
      file,
      url,
      isImage,
    })
    setCaption("")
    setCrop(undefined) // Reset crop on new file
    setCompletedCrop(undefined)
  }

  // Set a default 1:1 crop when the image loads
  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget
    setCrop(centerAspectCrop(width, height, 1 / 1)) // Default to 1:1
  }

  // Export canvas only for images
  const exportImageCanvas = useCallback(async (): Promise<Blob | null> => {
    const image = imgRef.current
    if (!image || !completedCrop) {
      // If there's no crop, maybe we upload the original?
      // For this demo, we'll assume a crop is necessary if it's an image.
      // Or if no crop, just upload state.file
      if (state.file && !completedCrop) {
        return state.file
      }
      return null
    }

    const canvas = document.createElement("canvas")
    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height
    // Ensure crisp image
    const pixelRatio = window.devicePixelRatio || 1

    canvas.width = Math.floor(completedCrop.width * scaleX * pixelRatio)
    canvas.height = Math.floor(completedCrop.height * scaleY * pixelRatio)

    const ctx = canvas.getContext("2d")
    if (!ctx) return null

    ctx.scale(pixelRatio, pixelRatio)
    ctx.imageSmoothingQuality = "high"

    const sourceX = completedCrop.x * scaleX
    const sourceY = completedCrop.y * scaleY
    const sourceWidth = completedCrop.width * scaleX
    const sourceHeight = completedCrop.height * scaleY

    ctx.drawImage(
      image,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    )

    return await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/jpeg", 0.9)
    )
  }, [completedCrop, state.file])

  const handleDiscard = () => {
    if (state.url) URL.revokeObjectURL(state.url)
    setState({
      isImage: true,
    })
    setCaption("")
    setCrop(undefined)
    setCompletedCrop(undefined)
  }

  // 🌩️ Upload to Cloudinary (frontend direct)
  async function uploadToCloudinary(file: File) {
    const data = new FormData()
    data.append("file", file)
    data.append("upload_preset", "unsigned_post_upload") // your preset
    const res = await fetch(
      "https://api.cloudinary.com/v1_1/duqral7bw/auto/upload",
      { method: "POST", body: data }
    )
    const result = await res.json()
    return result.secure_url
  }

  // 🧠 Handle Post Submission
  const handlePost = async () => {
    if (!state.file) {
      toast({
        title: "No media selected",
        description: "Please choose an image or video to post.",
      })
      return
    }
    try {
      const token = localStorage.getItem("token") // <-- Use the key you set during login
      if (!token) {
        throw new Error("No token found")
      }
      
      const decodedToken: { userId: string } = jwtDecode(token) // <-- Check your token's payload
      
      // 3. Extract the userId
      var userId=decodedToken.userId // <-- IMPORTANT: Your payload might use 'userId' or 'sub' instead of 'id'
      
    } catch (error) {
      toast({
        title: "Not Authenticated",
        description: "You must be logged in to post. Please log in again.",
        variant: "destructive",
      })
      return
    }

    if (!state.file) {
      toast({
        title: "No media selected",
        description: "Please choose an image or video to post.",
      })
      return
    }


    try {
      let uploadedUrl = ""
      let fileToUpload: File | Blob

      if (state.isImage) {
        const blob = await exportImageCanvas()
        if (!blob) throw new Error("Image export failed")
        fileToUpload = new File([blob], state.file.name, { type: blob.type })
      } else {
        // It's a video, upload the original file
        fileToUpload = state.file
      }

      uploadedUrl = await uploadToCloudinary(fileToUpload as File)

      // Now send URL + post details to backend
      await fetch("http://localhost:5000/posts/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId, // ⚠️ replace with logged-in user ID
          caption: caption, // Send the caption from state
          mediaUrl: uploadedUrl,
          postType: state.isImage ? "IMAGE" : "VIDEO", // Set postType correctly
        }),
      })

      toast({
        title: "Posted!",
        description: "Your post has been uploaded successfully.",
      })
      handleDiscard()
    } catch (err) {
      console.error(err)
      toast({
        title: "Upload failed",
        description: "Something went wrong while posting.",
      })
    }
  }

  return (
    <>
      {/* simple full-screen loader */}
      {posting && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-muted-foreground border-t-transparent" />
        </div>
      )}

      <Card className="shadow-sm">
        <CardHeader className="flex flex-col gap-2">
          <div className="grid gap-2">
            <Label htmlFor="media">Select image or video</Label>
            <Input id="media" type="file" accept="image/*,video/*" onChange={onFileChange} />
          </div>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="rounded-lg border bg-card">
            <div className="p-3">
              <div className="relative w-full overflow-hidden rounded-lg border bg-background">
                <div className="relative mx-auto touch-pan-y select-none">
                  {state.url ? (
                    state.isImage ? (
                      <ReactCrop crop={crop} onChange={(_, percentCrop) => setCrop(percentCrop)} onComplete={(c) => setCompletedCrop(c)}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img ref={imgRef} src={state.url} alt="Selected" className="mx-auto block max-h-[60vh] object-contain" onLoad={onImageLoad} draggable={false} />
                      </ReactCrop>
                    ) : (
                      <video src={state.url} controls className="mx-auto block max-h-[60vh] object-contain" />
                    )
                  ) : (
                    <div className="flex h-48 items-center justify-center text-muted-foreground">No media selected</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 rounded-lg border bg-card p-3">
            <div className="grid gap-2">
              <Label htmlFor="caption">Caption (optional)</Label>
              <Input id="caption" placeholder="Write a caption..." value={caption} onChange={(e) => setCaption(e.target.value)} />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <Button variant="outline" onClick={() => { if (state.url) URL.revokeObjectURL(state.url); setState({ isImage: true }); setCaption(""); setCrop(undefined); setCompletedCrop(undefined); }} disabled={posting}>
            Discard
          </Button>
          <Button onClick={handlePost} disabled={posting}>{posting ? "Posting…" : "Post"}</Button>
        </CardFooter>
      </Card>
    </>
  )
}
    <Card className="shadow-sm">
      <CardHeader className="flex flex-col gap-2">
        <div className="grid gap-2">
          <Label htmlFor="media">Select image or video</Label>
          <Input
            id="media"
            type="file"
            accept="image/*,video/*" // Accept both
            onChange={onFileChange}
          />
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        {/* Preview Area */}
        <div className="rounded-lg border bg-card">
          <div className="p-3">
            {/* Removed Aspect/Rotate controls */}

            <div className="relative w-full overflow-hidden rounded-lg border bg-background">
              <div className="relative mx-auto touch-pan-y select-none">
                {state.url ? (
                  state.isImage ? (
                    // --- Image Cropper ---
                    <ReactCrop
                      crop={crop}
                      onChange={(_, percentCrop) => setCrop(percentCrop)}
                      onComplete={(c) => setCompletedCrop(c)}
                      // You can add aspect={1 / 1} here if you want to force a square crop
                      // aspect={1 / 1}
                    >
                      <img
                        ref={imgRef}
                        src={state.url}
                        alt="Selected"
                        className="mx-auto block max-h-[60vh] object-contain"
                        onLoad={onImageLoad}
                        draggable={false}
                      />
                    </ReactCrop>
                  ) : (
                    // --- Video Preview ---
                    <video
                      src={state.url}
                      controls
                      className="mx-auto block max-h-[60vh] object-contain"
                    />
                  )
                ) : (
                  <div className="flex h-48 items-center justify-center text-muted-foreground">
                    No media selected
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Adjustments */}
        <div className="grid gap-4 rounded-lg border bg-card p-3">
          <div className="grid gap-2">
            <Label htmlFor="caption">Caption (optional)</Label>
            <Input
              id="caption"
              placeholder="Write a caption..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <Button variant="outline" onClick={handleDiscard}>
          Discard
        </Button>
        <Button onClick={handlePost}>Post</Button>
      </CardFooter>
    </Card>
  )
}
