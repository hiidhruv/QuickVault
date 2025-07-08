"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { Upload, X, CheckCircle, AlertCircle, Images, Plus } from "lucide-react"
import { formatBytes } from "@/lib/utils"

interface AlbumBulkUploadProps {
  albumId: string
  onUploadComplete: () => void
}

interface UploadFile {
  file: File
  id: string
  progress: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
}

export function AlbumBulkUpload({ albumId, onUploadComplete }: AlbumBulkUploadProps) {
  const [files, setFiles] = useState<UploadFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileSelect = (selectedFiles: File[]) => {
    const newFiles: UploadFile[] = selectedFiles.map(file => ({
      file,
      id: `${Date.now()}-${Math.random().toString(36).substring(2)}`,
      progress: 0,
      status: 'pending'
    }))

    setFiles(prev => [...prev, ...newFiles])
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const droppedFiles = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/') || file.type.startsWith('video/')
    )
    
    if (droppedFiles.length > 0) {
      handleFileSelect(droppedFiles)
    } else {
      toast({
        title: "Invalid files",
        description: "Please drop only image or video files",
        variant: "destructive",
      })
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileSelect(Array.from(e.target.files))
    }
  }

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const uploadFiles = async () => {
    if (files.length === 0) return

    setIsUploading(true)
    let successCount = 0
    let errorCount = 0

    for (const uploadFile of files) {
      if (uploadFile.status !== 'pending') continue

      try {
        // Update status to uploading
        setFiles(prev => prev.map(f => 
          f.id === uploadFile.id ? { ...f, status: 'uploading', progress: 0 } : f
        ))

        const formData = new FormData()
        formData.append('file', uploadFile.file)
        formData.append('title', uploadFile.file.name.split('.')[0])
        formData.append('albumId', albumId) // Add album ID to automatically add to album

        // Simulate progress (since we can't track real upload progress easily)
        const progressInterval = setInterval(() => {
          setFiles(prev => prev.map(f => 
            f.id === uploadFile.id && f.progress < 90 
              ? { ...f, progress: f.progress + 10 } 
              : f
          ))
        }, 100)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        clearInterval(progressInterval)

        const data = await response.json()

        if (data.success) {
          setFiles(prev => prev.map(f => 
            f.id === uploadFile.id 
              ? { ...f, status: 'success', progress: 100 } 
              : f
          ))
          successCount++
        } else {
          throw new Error(data.error || 'Upload failed')
        }
      } catch (error) {
        setFiles(prev => prev.map(f => 
          f.id === uploadFile.id 
            ? { 
                ...f, 
                status: 'error', 
                progress: 0,
                error: error instanceof Error ? error.message : 'Upload failed'
              } 
            : f
        ))
        errorCount++
      }
    }

    setIsUploading(false)

    // Show completion toast
    if (successCount > 0) {
      toast({
        title: "Upload Complete",
        description: `${successCount} files uploaded successfully${errorCount > 0 ? `, ${errorCount} failed` : ''}`,
      })
      onUploadComplete()
    }

    if (errorCount > 0 && successCount === 0) {
      toast({
        title: "Upload Failed",
        description: `${errorCount} files failed to upload`,
        variant: "destructive",
      })
    }
  }

  const clearCompleted = () => {
    setFiles(prev => prev.filter(f => f.status === 'pending' || f.status === 'uploading'))
  }

  const totalFiles = files.length
  const completedFiles = files.filter(f => f.status === 'success' || f.status === 'error').length
  const pendingFiles = files.filter(f => f.status === 'pending').length

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Bulk Upload to Album
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Drop Zone */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging 
              ? 'border-primary bg-primary/5' 
              : 'border-muted-foreground/25 hover:border-primary/50'
          }`}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
        >
          <div className="space-y-4">
            <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
              <Images className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-lg font-medium">
                Drop files here or click to upload
              </p>
              <p className="text-sm text-muted-foreground">
                Support for images and videos. Files will be added directly to this album.
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <Plus className="h-4 w-4 mr-2" />
              Select Files
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFileInput}
              className="hidden"
            />
          </div>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">
                Files ({totalFiles}) - {completedFiles} completed, {pendingFiles} pending
              </h3>
              <div className="flex gap-2">
                {completedFiles > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearCompleted}>
                    Clear Completed
                  </Button>
                )}
                {pendingFiles > 0 && (
                  <Button 
                    onClick={uploadFiles} 
                    disabled={isUploading}
                    size="sm"
                  >
                    {isUploading ? 'Uploading...' : `Upload ${pendingFiles} Files`}
                  </Button>
                )}
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2">
              {files.map((uploadFile) => (
                <div key={uploadFile.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="flex-shrink-0">
                    {uploadFile.status === 'success' && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                    {uploadFile.status === 'error' && (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    )}
                    {uploadFile.status === 'pending' && (
                      <div className="h-5 w-5 border-2 border-muted rounded-full" />
                    )}
                    {uploadFile.status === 'uploading' && (
                      <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{uploadFile.file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatBytes(uploadFile.file.size)}
                      {uploadFile.error && ` • ${uploadFile.error}`}
                    </p>
                    {uploadFile.status === 'uploading' && (
                      <Progress value={uploadFile.progress} className="h-1 mt-1" />
                    )}
                  </div>

                  {uploadFile.status === 'pending' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(uploadFile.id)}
                      disabled={isUploading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 