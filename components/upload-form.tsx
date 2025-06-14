"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Upload, Loader2, X, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Maximum file size for Vercel serverless functions (4.5MB to be safe)
const MAX_FILE_SIZE = 4.5 * 1024 * 1024

export function UploadForm() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [directUpload, setDirectUpload] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // Check if file is an image
    if (!selectedFile.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      })
      return
    }

    // Check file size for serverless function limit
    if (selectedFile.size > MAX_FILE_SIZE) {
      setDirectUpload(true)
      toast({
        title: "File size notice",
        description: "Large file detected. You'll be redirected to upload directly.",
        variant: "default",
      })
    } else {
      setDirectUpload(false)
    }

    console.log(
      "Selected file:",
      selectedFile.name,
      selectedFile.type,
      `${(selectedFile.size / 1024 / 1024).toFixed(2)}MB`,
    )
    setFile(selectedFile)

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(selectedFile)
  }

  const clearFile = () => {
    setFile(null)
    setPreview(null)
    setDirectUpload(false)
  }

  const handleDirectUpload = () => {
    if (!file) return

    // Create a form for direct upload to catbox.moe
    const form = document.createElement("form")
    form.method = "post"
    form.action = "https://catbox.moe/upload.php"
    form.enctype = "multipart/form-data"
    form.target = "_blank"

    // Create a new file input with the selected file
    const fileInput = document.createElement("input")
    fileInput.type = "file"
    fileInput.name = "fileToUpload"

    // Create a new DataTransfer object and add the file
    const dataTransfer = new DataTransfer()
    dataTransfer.items.add(file)
    fileInput.files = dataTransfer.files

    // Add hidden input for reqtype
    const reqTypeInput = document.createElement("input")
    reqTypeInput.type = "hidden"
    reqTypeInput.name = "reqtype"
    reqTypeInput.value = "fileupload"

    // Append inputs to form
    form.appendChild(fileInput)
    form.appendChild(reqTypeInput)

    // Append form to body, submit it, and remove it
    document.body.appendChild(form)
    form.submit()
    document.body.removeChild(form)

    toast({
      title: "Upload started",
      description: "A new tab has opened. After upload, copy the URL and paste it here.",
      duration: 10000,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select an image to upload",
        variant: "destructive",
      })
      return
    }

    // For large files, use direct upload
    if (directUpload) {
      handleDirectUpload()
      return
    }

    setIsUploading(true)

    try {
      // Create form data for the API request
      const formData = new FormData()
      formData.append("file", file)
      formData.append("title", title)
      formData.append("description", description)

      // Log the file type being uploaded
      console.log("Uploading file:", file.name, file.type, `${(file.size / 1024 / 1024).toFixed(2)}MB`)

      // Use the server API endpoint instead of direct Supabase client
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Upload failed")
      }

      toast({
        title: "Upload successful",
        description: `Your image has been uploaded as ${file.type}`,
      })

      // Redirect to the image page
      router.push(`/i/${data.media.id}`)
    } catch (error) {
      console.error("Upload error:", error)
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "There was an error uploading your image",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  // Add a manual URL input form
  const [manualUrl, setManualUrl] = useState("")

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!manualUrl) {
      toast({
        title: "No URL provided",
        description: "Please enter a catbox.moe URL",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append("catboxUrl", manualUrl)
      formData.append("title", title)
      formData.append("description", description)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok || data.success === false) {
        throw new Error(data.error || "Upload failed")
      }

      toast({
        title: "URL added to gallery",
        description: "The Catbox URL has been successfully indexed and added to your gallery.",
      })

      // Redirect to the media page
      router.push(`/i/${data.media.id}`)
    } catch (error) {
      console.error("Manual URL upload error:", error)
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "There was an error processing your URL",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      setManualUrl("") // Clear the URL input after submission
    }
  }

  return (
    <div className="space-y-6">
      {!file ? (
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div
              className="flex flex-col items-center justify-center p-8 text-center cursor-pointer"
              onClick={() => document.getElementById("file-upload")?.click()}
            >
              <Upload className="h-10 w-10 text-muted-foreground mb-4" />
              <h3 className="font-medium text-lg mb-2">Drag & drop or click to upload</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Supports JPG, PNG, GIF, WEBP (max 4.5MB for automatic upload)
              </p>
              <Button type="button" variant="outline">
                Select Image
              </Button>
              <input id="file-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <div className="aspect-video relative overflow-hidden">
                <img src={preview! || "/placeholder.svg"} alt="Preview" className="object-contain w-full h-full" />
              </div>
              <Button
                type="button"
                size="icon"
                variant="destructive"
                className="absolute top-2 right-2"
                onClick={clearFile}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB) - {file.type}
            </div>

            {directUpload && (
              <Alert className="mt-4" variant="warning">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Large file detected</AlertTitle>
                <AlertDescription>
                  This file is larger than 4.5MB. You'll need to upload it directly to catbox.moe.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title (optional)</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add a title to your image"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description (optional)</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a description to your image"
            rows={3}
          />
        </div>
      </div>

      <div className="flex justify-end">
        {directUpload ? (
          <Button type="button" onClick={handleDirectUpload} disabled={!file || isUploading}>
            Upload Directly to Catbox.moe
          </Button>
        ) : (
          <Button type="button" onClick={handleSubmit} disabled={!file || isUploading}>
            {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isUploading ? "Uploading..." : "Upload Image"}
          </Button>
        )}
      </div>

      <div className="pt-6 border-t mt-8">
        <h3 className="text-lg font-medium mb-4">Already uploaded to catbox.moe?</h3>
        <form onSubmit={handleManualSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="manual-url">Paste catbox.moe URL</Label>
            <Input
              id="manual-url"
              value={manualUrl}
              onChange={(e) => setManualUrl(e.target.value)}
              placeholder="https://files.catbox.moe/example.jpg"
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" variant="outline" disabled={isUploading}>
              {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isUploading ? "Adding..." : "Add to Gallery"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
