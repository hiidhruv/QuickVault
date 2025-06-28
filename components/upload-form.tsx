"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Upload, Loader2, X, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Maximum file size for Vercel serverless functions (4.5MB to be safe)
const MAX_FILE_SIZE = 4.5 * 1024 * 1024

// Supported video formats
const SUPPORTED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm', 
  'video/mov',
  'video/avi',
  'video/mkv',
  'video/wmv',
  'video/flv',
  'video/3gp'
]

// Supported image formats  
const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/gif',
  'image/webp',
  'image/bmp',
  'image/svg+xml'
]

export function UploadForm() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [fileType, setFileType] = useState<'image' | 'video' | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("uncategorized")
  const [customCategory, setCustomCategory] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [directUpload, setDirectUpload] = useState(false)
  const [userCategories, setUserCategories] = useState<string[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  // Fetch existing categories from database
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories")
        const data = await response.json()
        setUserCategories(data.categories || [])
      } catch (error) {
        console.error("Error fetching categories:", error)
      }
    }
    fetchCategories()
  }, [])

  // Extracted file processing logic to reuse for both file input and drop
  const processFile = (selectedFile: File) => {
    // Check if file is a supported media type
    const isImage = SUPPORTED_IMAGE_TYPES.includes(selectedFile.type) || selectedFile.type.startsWith("image/")
    const isVideo = SUPPORTED_VIDEO_TYPES.includes(selectedFile.type) || selectedFile.type.startsWith("video/")
    
    if (!isImage && !isVideo) {
      toast({
        title: "Invalid file type",
        description: "Please select an image or video file",
        variant: "destructive",
      })
      return false
    }

    // Set file type for UI rendering
    setFileType(isImage ? 'image' : 'video')

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
    
    return true
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return
    processFile(selectedFile)
  }

  // Drag and drop event handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Only set drag over to false if we're leaving the drop zone entirely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Ensure we show the copy cursor
    e.dataTransfer.dropEffect = 'copy'
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length === 0) return

    // Only handle the first file
    const droppedFile = files[0]
    
    if (files.length > 1) {
      toast({
        title: "Multiple files detected",
        description: "Please drop only one file at a time. Using the first file.",
        variant: "default",
      })
    }

    processFile(droppedFile)
  }

  const clearFile = () => {
    setFile(null)
    setPreview(null)
    setFileType(null)
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

  const getSelectedCategory = () => {
    return category === "custom" ? customCategory : category
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select an image or video to upload",
        variant: "destructive",
      })
      return
    }

    const finalCategory = getSelectedCategory()
    if (!finalCategory.trim()) {
      toast({
        title: "Category required",
        description: "Please select or enter a category",
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
      formData.append("category", finalCategory)

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
        description: `Your ${fileType} has been uploaded to "${finalCategory}" category`,
      })

      // Redirect to the media page
      router.push(`/i/${data.media.id}`)
    } catch (error) {
      console.error("Upload error:", error)
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : `There was an error uploading your ${fileType}`,
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

    const finalCategory = getSelectedCategory()
    if (!finalCategory.trim()) {
      toast({
        title: "Category required",
        description: "Please select or enter a category",
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
      formData.append("category", finalCategory)

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
        description: `The Catbox URL has been successfully indexed and added to "${finalCategory}" category.`,
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
        <Card className={`border-dashed transition-colors duration-200 ${
          isDragOver 
            ? 'border-primary bg-primary/5 border-2' 
            : 'border-muted-foreground/25 hover:border-muted-foreground/50'
        }`}>
          <CardContent className="pt-6">
            <div
              className={`flex flex-col items-center justify-center p-8 text-center cursor-pointer transition-all duration-200 ${
                isDragOver ? 'scale-105' : ''
              }`}
              onClick={() => document.getElementById("file-upload")?.click()}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <Upload className={`h-10 w-10 mb-4 transition-colors duration-200 ${
                isDragOver ? 'text-primary' : 'text-muted-foreground'
              }`} />
              <h3 className={`font-medium text-lg mb-2 transition-colors duration-200 ${
                isDragOver ? 'text-primary' : ''
              }`}>
                {isDragOver ? 'Drop your file here!' : 'Drag & drop or click to upload'}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Supports images (JPG, PNG, GIF, WEBP) and videos (MP4, WEBM, MOV, AVI) - max 4.5MB for automatic upload
              </p>
              <Button type="button" variant={isDragOver ? "default" : "outline"} className="transition-all duration-200">
                {isDragOver ? 'Drop File' : 'Select Media'}
              </Button>
              <input 
                id="file-upload" 
                type="file" 
                accept="image/*,video/*" 
                className="hidden" 
                onChange={handleFileChange} 
              />
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <div className="aspect-video relative overflow-hidden">
                {fileType === 'video' ? (
                  <video 
                    src={preview!} 
                    controls 
                    className="object-contain w-full h-full"
                    muted
                  />
                ) : (
                  <img src={preview! || "/placeholder.svg"} alt="Preview" className="object-contain w-full h-full" />
                )}
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
              <Alert className="mt-4" variant="default">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title (optional)</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={`Add a title to your ${fileType === 'video' ? 'Video' : 'Image'}`}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="uncategorized">Uncategorized</SelectItem>
              {userCategories.length > 0 && (
                <>
                  <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Your Categories</div>
                  {userCategories.map((cat) => (
                    <SelectItem key={cat} value={cat} className="capitalize">
                      {cat}
                    </SelectItem>
                  ))}
                </>
              )}
              <SelectItem value="custom">+ Custom Category</SelectItem>
            </SelectContent>
          </Select>
          {category === "custom" && (
            <Input
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              placeholder="Enter custom category"
              className="mt-2"
              autoFocus
            />
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={`Add a description to your ${fileType === 'video' ? 'Video' : 'Image'}`}
          rows={3}
        />
      </div>

      <div className="flex justify-end">
        {directUpload ? (
          <Button type="button" onClick={handleDirectUpload} disabled={!file || isUploading}>
            Upload Directly to Catbox.moe
          </Button>
        ) : (
          <Button type="button" onClick={handleSubmit} disabled={!file || isUploading}>
            {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isUploading ? "Uploading..." : `Upload ${fileType === 'video' ? 'Video' : 'Image'}`}
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
              placeholder="https://files.catbox.moe/example.mp4 or .jpg"
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
