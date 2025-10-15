"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import DOMPurify from "dompurify"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

type FontSizeOption = "Small" | "Normal" | "Large"
const fontSizeMap: Record<FontSizeOption, string> = {
  Small: "2",
  Normal: "3",
  Large: "5",
}

export default function PostTextCreator() {
  const { toast } = useToast()
  const editorRef = useRef<HTMLDivElement | null>(null)
  const [html, setHtml] = useState<string>("")
  const [preview, setPreview] = useState<boolean>(false)
  const [fontSize, setFontSize] = useState<FontSizeOption>("Normal")
  const [textColor, setTextColor] = useState<string>("#111111")
  const [highlightColor, setHighlightColor] = useState<string>("#ffff00")

  useEffect(() => {
    // Enable CSS-based styling for execCommand where supported
    try {
      document.execCommand("styleWithCSS", false, "true")
    } catch {}
  }, [])

  const onInput = () => {
    setHtml(editorRef.current?.innerHTML ?? "")
  }

  const exec = (cmd: string, value?: string) => {
    document.execCommand(cmd, false, value)
    onInput()
    editorRef.current?.focus()
  }

  const sanitized = useMemo(() => {
    return DOMPurify.sanitize(html, {
      ALLOWED_ATTR: ["style", "class"],
      ALLOWED_TAGS: ["b", "strong", "i", "em", "u", "p", "br", "ul", "ol", "li", "span", "div", "h1", "h2", "h3"],
    })
  }, [html])

  const handlePost = () => {
    console.log("[v0] Posting text html:", sanitized)
    toast({ title: "Posted!", description: "Your text post has been prepared." })
  }

  const handleDiscard = () => {
    setHtml("")
    if (editorRef.current) editorRef.current.innerHTML = ""
    toast({ title: "Discarded", description: "Your draft was cleared." })
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => exec("bold")} aria-label="Bold">
              <span className="font-semibold">B</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => exec("italic")} aria-label="Italic">
              <span className="italic">I</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => exec("underline")} aria-label="Underline">
              <span className="underline">U</span>
            </Button>
          </div>

          <Separator orientation="vertical" className="h-8" />

          <div className="flex items-center gap-2">
            <Select
              value={fontSize}
              onValueChange={(v: FontSizeOption) => {
                setFontSize(v)
                exec("fontSize", fontSizeMap[v])
              }}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Font size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Small">Small</SelectItem>
                <SelectItem value="Normal">Normal</SelectItem>
                <SelectItem value="Large">Large</SelectItem>
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" aria-label="Text color">
                  Text
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48">
                <div className="grid gap-2">
                  <Label htmlFor="tc">Text color</Label>
                  <input
                    id="tc"
                    type="color"
                    value={textColor}
                    onChange={(e) => {
                      setTextColor(e.target.value)
                      exec("foreColor", e.target.value)
                    }}
                  />
                </div>
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" aria-label="Highlight">
                  Highlight
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48">
                <div className="grid gap-2">
                  <Label htmlFor="hc">Highlight color</Label>
                  <input
                    id="hc"
                    type="color"
                    value={highlightColor}
                    onChange={(e) => {
                      setHighlightColor(e.target.value)
                      // hiliteColor for Chrome, backColor for some browsers
                      exec("hiliteColor", e.target.value)
                    }}
                  />
                </div>
              </PopoverContent>
            </Popover>

            <Button variant="outline" size="sm" onClick={() => exec("insertUnorderedList")} aria-label="Bulleted list">
              • List
            </Button>
            <Button variant="outline" size="sm" onClick={() => exec("insertOrderedList")} aria-label="Numbered list">
              1. List
            </Button>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Label htmlFor="preview">Live preview</Label>
            <Switch id="preview" checked={preview} onCheckedChange={setPreview} />
          </div>
        </div>
      </CardHeader>

      <CardContent className="grid gap-4">
        {/* Editor */}
        <div
          ref={editorRef}
          onInput={onInput}
          contentEditable
          role="textbox"
          aria-multiline
          className="min-h-[320px] rounded-lg border bg-background p-4 leading-relaxed focus:outline-none"
          placeholder="Start writing..."
          suppressContentEditableWarning
        />
        {preview && (
          <div className="rounded-lg border bg-card">
            <div className="border-b px-4 py-2 text-sm text-muted-foreground">Preview</div>
            <div
              className="prose max-w-none p-4"
              // Safe sanitized HTML preview
              dangerouslySetInnerHTML={{ __html: sanitized }}
            />
          </div>
        )}
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
