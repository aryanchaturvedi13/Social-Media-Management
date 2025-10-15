"use client"

import type React from "react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { useToast } from "@/components/ui/use-toast"

// Types
type AspectKey = "original" | "1:1" | "4:5" | "16:9"

type MediaState = {
  file?: File
  url?: string
  isImage: boolean
  rotation: number // degrees (0, 90, 180, 270)
  brightness: number // 0.5 - 2
  contrast: number // 0.5 - 2
  zoom: number // 1 - 3
  offsetX: number // px
  offsetY: number // px
  aspect: AspectKey
}

const aspectToRatio: Record<AspectKey, number | "auto"> = {
  original: "auto",
  "1:1": 1,
  "4:5": 4 / 5,
  "16:9": 16 / 9,
}

export default function PostMediaCreator() {
  const { toast } = useToast()
  const [state, setState] = useState<MediaState>({
    isImage: true,
    rotation: 0,
    brightness: 1,
    contrast: 1,
    zoom: 1,
    offsetX: 0,
    offsetY: 0,
    aspect: "original",
  })

  const dragRef = useRef<{
    dragging: boolean
    startX: number
    startY: number
    startOffsetX: number
    startOffsetY: number
  }>({
    dragging: false,
    startX: 0,
    startY: 0,
    startOffsetX: 0,
    startOffsetY: 0,
  })
  const containerRef = useRef<HTMLDivElement | null>(null)

  // Revoke objectURL on unmount or file change
  useEffect(() => {
    return () => {
      if (state.url) URL.revokeObjectURL(state.url)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (state.url) URL.revokeObjectURL(state.url)
    const url = URL.createObjectURL(file)
    setState((s) => ({
      ...s,
      file,
      url,
      isImage: file.type.startsWith("image/"),
      rotation: 0,
      brightness: 1,
      contrast: 1,
      zoom: 1,
      offsetX: 0,
      offsetY: 0,
    }))
  }

  const transformStyle = useMemo(() => {
    return {
      transform: `translate(${state.offsetX}px, ${state.offsetY}px) rotate(${state.rotation}deg) scale(${state.zoom})`,
      filter: `brightness(${state.brightness}) contrast(${state.contrast})`,
      transition: "transform 120ms ease",
    } as React.CSSProperties
  }, [state.offsetX, state.offsetY, state.rotation, state.zoom, state.brightness, state.contrast])

  const onPointerDown = (e: React.PointerEvent) => {
    if (!state.url) return
    dragRef.current.dragging = true
    dragRef.current.startX = e.clientX
    dragRef.current.startY = e.clientY
    dragRef.current.startOffsetX = state.offsetX
    dragRef.current.startOffsetY = state.offsetY
    ;(e.target as Element).setPointerCapture?.(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current.dragging) return
    const dx = e.clientX - dragRef.current.startX
    const dy = e.clientY - dragRef.current.startY
    setState((s) => ({ ...s, offsetX: dragRef.current.startOffsetX + dx, offsetY: dragRef.current.startOffsetY + dy }))
  }

  const onPointerUp = (e: React.PointerEvent) => {
    if (!dragRef.current.dragging) return
    dragRef.current.dragging = false
    ;(e.target as Element).releasePointerCapture?.(e.pointerId)
  }

  const resetAdjustments = () => {
    setState((s) => ({ ...s, rotation: 0, brightness: 1, contrast: 1, zoom: 1, offsetX: 0, offsetY: 0 }))
  }

  // Export canvas only for images
  const exportImageCanvas = useCallback(async (): Promise<Blob | null> => {
    if (!state.url || !state.isImage) return null
    const ratio = aspectToRatio[state.aspect]
    // Create image
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image()
      i.onload = () => resolve(i)
      i.onerror = reject
      i.src = state.url!
      i.crossOrigin = "anonymous"
    })

    // Compute output canvas size (use 1080 width baseline)
    const outW = 1080
    let outH = 1080
    if (ratio === "auto") {
      // derive from transformed bounds; fallback to image aspect
      const asp = img.width / img.height
      outH = Math.round(outW / asp)
    } else {
      outH = Math.round(outW / (ratio as number))
    }
    const canvas = document.createElement("canvas")
    canvas.width = outW
    canvas.height = outH
    const ctx = canvas.getContext("2d")
    if (!ctx) return null

    // Fill background (for videos we'd need a different pipeline)
    ctx.save()
    ctx.fillStyle = "#000"
    ctx.fillRect(0, 0, outW, outH)
    ctx.restore()

    // Center coords
    const cx = outW / 2
    const cy = outH / 2

    // Apply transforms: translate center, apply user pan offsets scaled, rotate, scale (zoom), then draw image centered
    ctx.save()
    ctx.translate(cx + state.offsetX, cy + state.offsetY)
    ctx.rotate((state.rotation * Math.PI) / 180)
    ctx.scale(state.zoom, state.zoom)

    // Apply brightness/contrast via canvas filter
    ctx.filter = `brightness(${state.brightness}) contrast(${state.contrast})`

    // Draw image centered
    ctx.drawImage(img, -img.width / 2, -img.height / 2)

    ctx.restore()

    return await new Promise<Blob | null>((resolve) => canvas.toBlob((b) => resolve(b), "image/jpeg", 0.9))
  }, [
    state.url,
    state.isImage,
    state.aspect,
    state.offsetX,
    state.offsetY,
    state.rotation,
    state.zoom,
    state.brightness,
    state.contrast,
  ])

  const handlePost = async () => {
    if (!state.file) {
      toast({ title: "No media selected", description: "Please choose an image or video to post." })
      return
    }

    if (state.isImage) {
      const blob = await exportImageCanvas()
      if (blob) {
        console.log("[v0] Posting image with edits:", {
          name: state.file.name,
          size: blob.size,
          type: blob.type,
          rotation: state.rotation,
          brightness: state.brightness,
          contrast: state.contrast,
          zoom: state.zoom,
          offsetX: state.offsetX,
          offsetY: state.offsetY,
          aspect: state.aspect,
        })
        toast({ title: "Posted!", description: "Your image post has been prepared." })
      } else {
        toast({ title: "Export failed", description: "Could not process the image." })
      }
    } else {
      console.log("[v0] Posting video (preview-only edits):", {
        name: state.file.name,
        rotation: state.rotation,
        brightness: state.brightness,
        contrast: state.contrast,
        zoom: state.zoom,
        offsetX: state.offsetX,
        offsetY: state.offsetY,
        aspect: state.aspect,
      })
      toast({ title: "Posted!", description: "Your video post has been prepared (edits are preview-only)." })
    }
  }

  const handleDiscard = () => {
    if (state.url) URL.revokeObjectURL(state.url)
    setState({
      isImage: true,
      rotation: 0,
      brightness: 1,
      contrast: 1,
      zoom: 1,
      offsetX: 0,
      offsetY: 0,
      aspect: "original",
    })
    toast({ title: "Discarded", description: "Your changes have been discarded." })
  }

  const ratio = aspectToRatio[state.aspect]

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-col gap-2">
        <div className="grid gap-2">
          <Label htmlFor="media">Select image or video</Label>
          <Input id="media" type="file" accept="image/*,video/*" onChange={onFileChange} />
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        {/* Preview Area */}
        <div className="rounded-lg border bg-card">
          <div className="p-3">
            <div className="mb-3 flex items-center gap-3">
              <div className="grid gap-1">
                <Label className="text-sm">Aspect ratio</Label>
                <Select value={state.aspect} onValueChange={(v: AspectKey) => setState((s) => ({ ...s, aspect: v }))}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Aspect" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="original">Original</SelectItem>
                    <SelectItem value="1:1">Square (1:1)</SelectItem>
                    <SelectItem value="4:5">Portrait (4:5)</SelectItem>
                    <SelectItem value="16:9">Landscape (16:9)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator orientation="vertical" className="h-10" />

              <div className="flex items-center gap-2">
                <Label className="text-sm">Rotate</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setState((s) => ({ ...s, rotation: (s.rotation + 270) % 360 }))}
                >
                  ↶ 90°
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setState((s) => ({ ...s, rotation: (s.rotation + 90) % 360 }))}
                >
                  ↷ 90°
                </Button>
                <Button variant="ghost" size="sm" onClick={resetAdjustments}>
                  Reset
                </Button>
              </div>
            </div>

            <div className="relative w-full overflow-hidden rounded-lg border bg-background">
              <div
                ref={containerRef}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                className="relative mx-auto touch-pan-y select-none"
              >
                {ratio === "auto" ? (
                  <div className="relative">
                    {state.url ? (
                      state.isImage ? (
                        <img
                          src={state.url || "/placeholder.svg"}
                          alt="Selected"
                          className="mx-auto block max-h-[60vh] object-contain"
                          style={transformStyle}
                          draggable={false}
                        />
                      ) : (
                        <video
                          src={state.url}
                          controls
                          className="mx-auto block max-h-[60vh] object-contain"
                          style={transformStyle}
                        />
                      )
                    ) : (
                      <div className="flex h-48 items-center justify-center text-muted-foreground">
                        No media selected
                      </div>
                    )}
                  </div>
                ) : (
                  <AspectRatio ratio={ratio as number}>
                    <div className="absolute inset-0 overflow-hidden bg-black/80">
                      {state.url ? (
                        state.isImage ? (
                          <img
                            src={state.url || "/placeholder.svg"}
                            alt="Selected"
                            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none"
                            style={transformStyle}
                            draggable={false}
                          />
                        ) : (
                          <video
                            src={state.url}
                            controls
                            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                            style={transformStyle}
                          />
                        )
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                          No media selected
                        </div>
                      )}
                    </div>
                  </AspectRatio>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Adjustments */}
        <div className="grid gap-4 rounded-lg border bg-card p-3">
          <div className="grid gap-2">
            <Label>Brightness</Label>
            <Slider
              value={[state.brightness]}
              min={0.5}
              max={2}
              step={0.1}
              onValueChange={([v]) => setState((s) => ({ ...s, brightness: v }))}
            />
          </div>
          <div className="grid gap-2">
            <Label>Contrast</Label>
            <Slider
              value={[state.contrast]}
              min={0.5}
              max={2}
              step={0.1}
              onValueChange={([v]) => setState((s) => ({ ...s, contrast: v }))}
            />
          </div>
          <div className="grid gap-2">
            <Label>Zoom</Label>
            <Slider
              value={[state.zoom]}
              min={1}
              max={3}
              step={0.05}
              onValueChange={([v]) => setState((s) => ({ ...s, zoom: v }))}
            />
            <span className="text-xs text-muted-foreground">Drag on the preview to pan</span>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="caption">Caption (optional)</Label>
            <Input id="caption" placeholder="Write a caption..." />
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
