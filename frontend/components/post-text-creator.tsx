"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import DOMPurify from "dompurify"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { jwtDecode } from "jwt-decode"
import { useRouter } from "next/navigation"

type FontSizeOption = "Small" | "Normal" | "Large"
const fontSizeMap: Record<FontSizeOption, string> = { Small: "2", Normal: "3", Large: "5" }

export default function PostTextCreator() {
  const router = useRouter()

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
  const [posting, setPosting] = useState(false)

  useEffect(() => {
    try { document.execCommand("styleWithCSS", false, "true") } catch {}
  }, [])

  const onInput = () => setHtml(editorRef.current?.innerHTML ?? "")
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

  async function uploadTextToCloudinary(text: string, fileName = "content.txt") {
    const file = new File([text], fileName, { type: "text/plain" })
    const data = new FormData()
    data.append("file", file)
    data.append("upload_preset", "unsigned_raw_upload")
    const res = await fetch("https://api.cloudinary.com/v1_1/duqral7bw/raw/upload", { method: "POST", body: data })
    const result = await res.json()
    return result.secure_url as string
  }

  const handlePost = async () => {
    let userId: string | number
    if (!sanitized || sanitized.trim() === "<p></p>" || sanitized.trim() === "") {
      toast({ title: "Cannot post empty content", variant: "destructive" }); return;
    }
    try {
      const token = localStorage.getItem("token"); if (!token) throw new Error("No token")
      const decoded: { userId: string | number } = jwtDecode(token); userId = decoded.userId
    } catch {
      toast({ title: "Not Authenticated", description: "You must be logged in to post.", variant: "destructive" }); return
    }

    const tmp = document.createElement("div"); tmp.innerHTML = sanitized
    const plain = (tmp.textContent || tmp.innerText || "").trim()
    const caption = plain.slice(0, 180)

    try {
      setPosting(true)
      const uploadedUrl = await uploadTextToCloudinary(sanitized)
      const res = await fetch("http://localhost:5000/posts/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, caption, mediaUrl: uploadedUrl, postType: "TEXT" }),
      })
      const post = await res.json()
      toast({ title: "Posted!", description: "Your text post has been successfully uploaded." })
      setPosting(false)
      router.push(`/profile?post=${encodeURIComponent(post.id)}`)
    } catch (err) {
      console.error(err)
      setPosting(false)
      toast({ title: "Upload failed", description: "Something went wrong while posting.", variant: "destructive" })
    }
  }

  const handleDiscard = () => { setHtml(""); if (editorRef.current) editorRef.current.innerHTML = ""; }

  return (
    <>
      {posting && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-muted-foreground border-t-transparent" />
        </div>
      )}

      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => exec("bold")} aria-label="Bold"><span className="font-semibold">B</span></Button>
              <Button variant="outline" size="sm" onClick={() => exec("italic")} aria-label="Italic"><span className="italic">I</span></Button>
              <Button variant="outline" size="sm" onClick={() => exec("underline")} aria-label="Underline"><span className="underline">U</span></Button>
            </div>
            <Separator orientation="vertical" className="h-8" />
            <div className="flex items-center gap-2">
              <Select value={fontSize} onValueChange={(v: FontSizeOption) => { setFontSize(v); exec("fontSize", fontSizeMap[v]) }}>
                <SelectTrigger className="w-[140px]"><SelectValue placeholder="Font size" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Small">Small</SelectItem>
                  <SelectItem value="Normal">Normal</SelectItem>
                  <SelectItem value="Large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Label htmlFor="preview">Live preview</Label>
              <Switch id="preview" checked={preview} onCheckedChange={setPreview} />
            </div>
          </div>
        </CardHeader>

        <CardContent className="grid gap-4 relative">
          <div
            ref={editorRef}
            onInput={onInput}
            contentEditable
            role="textbox"
            aria-multiline
            className="min-h-[320px] rounded-lg border bg-background p-4 leading-relaxed focus:outline-none"
            suppressContentEditableWarning
          />
          {(!html && (!editorRef.current || !editorRef.current.innerText)) && (
            <span className="pointer-events-none absolute p-4 select-none text-muted-foreground">Start writing...</span>
          )}
          {preview && (
            <div className="rounded-lg border bg-card">
              <div className="border-b px-4 py-2 text-sm text-muted-foreground">Preview</div>
              <div className="prose max-w-none p-4" dangerouslySetInnerHTML={{ __html: sanitized }} />
            </div>
          )}
        </CardContent>

        <CardFooter className="flex items-center justify-between">
          <Button variant="outline" onClick={handleDiscard} disabled={posting}>Discard</Button>
          <Button onClick={handlePost} disabled={posting}>{posting ? "Posting…" : "Post"}</Button>
        </CardFooter>
      </Card>
    </>
  // Upload to Cloudinary 
  // This is your new function for uploading text
  async function uploadTextToCloudinary(text: string, fileName: string = "content.txt") {
    // 1. Create a File object from the text string
    const file = new File([text], fileName, { type: "text/plain" });

    const data = new FormData();
    data.append("file", file);
    // 2. Use your NEW preset for raw uploads
    data.append("upload_preset", "unsigned_raw_upload"); // <-- Use the preset you just made

    // 3. Call the 'raw' upload endpoint
    const res = await fetch(
      "https://api.cloudinary.com/v1_1/duqral7bw/raw/upload", // <-- Note '/raw/' instead of '/auto/'
      { method: "POST", body: data }
  );
  
    const result = await res.json();
    return result.secure_url; // This will be the link to your .txt file
  }

  const handlePost = async () => {
    let userId: string | number;

    // 1. Check if the post is empty
    if (!sanitized || sanitized.trim() === "<p></p>" || sanitized.trim() === "") {
      toast({ title: "Cannot post empty content", variant: "destructive" });
      return;
    }

    // 2. Get User ID from token
    try {
      const token = localStorage.getItem("token"); 
      if (!token) throw new Error("No token found");
      const decodedToken: { userId: string | number } = jwtDecode(token);
      userId = decodedToken.userId; 
    } catch (error) {
      toast({
        title: "Not Authenticated",
        description: "You must be logged in to post.",
        variant: "destructive",
      });
      return;
    }

    // 3. Upload text and send to backend
    try {
      // 3a. Upload the 'sanitized' HTML to Cloudinary
      const uploadedUrl = await uploadTextToCloudinary(sanitized);

      // 3b. Send the new post to your own backend
      await fetch("http://localhost:5000/posts/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId,
          content: "", // Caption is empty, the 'mediaUrl' holds the text
          mediaUrl: uploadedUrl,
          postType: "TEXT", // Use a new post type for text
        }),
      });

      // 3c. Success!
      toast({
        title: "Posted!",
        description: "Your text post has been successfully uploaded.",
      });
      
      // handleDiscard(); // Optionally clear the editor after posting

    } catch (err) {
      console.error(err);
      toast({
        title: "Upload failed",
        description: "Something went wrong while posting.",
        variant: "destructive",
      });
    }
  };

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
          suppressContentEditableWarning
        />
        {/* Show placeholder when editor is empty */}
        {(!html && (!editorRef.current || !editorRef.current.innerText)) && (
          <span className="pointer-events-none absolute p-4 text-muted-foreground select-none">
            Start writing...
          </span>
        )}
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
