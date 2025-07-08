"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Save, Share, ExternalLink, Plus, X, Images } from "lucide-react"
import { CopyButton } from "@/components/copy-button"
import Link from "next/link"
import Image from "next/image"
import { formatBytes } from "@/lib/utils"
import type { Database } from "@/lib/database.types"
import { AlbumBulkUpload } from "@/components/album-bulk-upload"

type AlbumType = Database["public"]["Tables"]["albums"]["Row"]
type ImageType = Database["public"]["Tables"]["images"]["Row"]

export default function AlbumManagePage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const albumId = params.id as string

  const [album, setAlbum] = useState<AlbumType | null>(null)
  const [albumImages, setAlbumImages] = useState<ImageType[]>([])
  const [availableImages, setAvailableImages] = useState<ImageType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({ title: "", description: "", is_public: false })

  // Fetch album details and images
  const fetchAlbumData = async () => {
    try {
      // Fetch album details
      const albumResponse = await fetch(`/api/albums/${albumId}`)
      const albumData = await albumResponse.json()

      if (albumData.success) {
        setAlbum(albumData.album)
        setEditForm({
          title: albumData.album.title,
          description: albumData.album.description || "",
          is_public: albumData.album.is_public
        })

        // Extract album images
        const images = albumData.album.album_images?.map((ai: any) => ai.images).filter(Boolean) || []
        setAlbumImages(images)
      }

      // Fetch all available images
      const imagesResponse = await fetch('/api/upload')
      const imagesData = await imagesResponse.json()
      
      if (imagesData.success) {
        setAvailableImages(imagesData.media)
      }
    } catch (error) {
      console.error("Error fetching album data:", error)
      toast({
        title: "Error",
        description: "Failed to load album data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Save album changes
  const handleSaveAlbum = async () => {
    try {
      const response = await fetch(`/api/albums/${albumId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      })

      const data = await response.json()

      if (data.success) {
        setAlbum(data.album)
        setIsEditing(false)
        toast({
          title: "Success",
          description: "Album updated successfully",
        })
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update album",
        variant: "destructive",
      })
    }
  }

  // Add images to album
  const handleAddImages = async (imageIds: string[]) => {
    try {
      const response = await fetch(`/api/albums/${albumId}/images`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageIds }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: `Added ${data.added_count} images to album`,
        })
        // Refresh album data
        fetchAlbumData()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add images to album",
        variant: "destructive",
      })
    }
  }

  // Remove image from album
  const handleRemoveImage = async (imageId: string) => {
    try {
      const response = await fetch(`/api/albums/${albumId}/images`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageIds: [imageId] }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Image removed from album",
        })
        // Refresh album data
        fetchAlbumData()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove image from album",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    fetchAlbumData()
  }, [albumId])

  const getShareUrl = () => {
    if (typeof window !== 'undefined' && album) {
      return `${window.location.origin}/album/${album.share_code}`
    }
    return ""
  }

  // Get images not in album
  const imagesNotInAlbum = availableImages.filter(
    img => !albumImages.some(albumImg => albumImg.id === img.id)
  )

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="flex min-h-screen items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (!album) {
    return (
      <div className="page-container">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Album Not Found</h1>
          <Link href="/albums">
            <Button>Back to Albums</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/albums">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Albums
          </Button>
        </Link>
        <div className="flex-1">
          {isEditing ? (
            <div className="space-y-4">
              <Input
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                placeholder="Album title"
                className="text-2xl font-bold bg-transparent border-none p-0 h-auto"
              />
              <Textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder="Album description"
                className="bg-transparent border-none p-0 resize-none"
                rows={2}
              />
            </div>
          ) : (
            <div>
              <h1 className="text-3xl font-bold">{album.title}</h1>
              {album.description && (
                <p className="text-muted-foreground mt-2">{album.description}</p>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={album.is_public ? "default" : "secondary"}>
            {album.is_public ? "Public" : "Private"}
          </Badge>
          {isEditing ? (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveAlbum}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          ) : (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
          )}
        </div>
      </div>

      {/* Album Stats & Share */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Images className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{albumImages.length}</p>
                <p className="text-sm text-muted-foreground">Images in album</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Share className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{album.is_public ? "Enabled" : "Disabled"}</p>
                <p className="text-sm text-muted-foreground">Public sharing</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {album.is_public && (
          <Card>
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <ExternalLink className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-medium">Share Link</span>
                </div>
                <CopyButton
                  value={getShareUrl()}
                  label="Copy Share Link"
                  variant="outline"
                  size="sm"
                  className="w-full"
                />
                <Link href={`/album/${album.share_code}`} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="sm" className="w-full">
                    Preview Album
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Bulk Upload Section */}
      <div className="mb-8">
        <AlbumBulkUpload albumId={albumId} onUploadComplete={fetchAlbumData} />
      </div>

      {/* Album Images */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Album Images ({albumImages.length})</h2>
          <Button 
            onClick={() => {
              // Scroll to available images section
              document.getElementById('available-images')?.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Existing Images
          </Button>
        </div>

        {albumImages.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {albumImages.map((image) => (
              <div key={image.id} className="group relative overflow-hidden border rounded-lg">
                <div className="aspect-square relative">
                  <Image
                    src={image.public_url}
                    alt={image.title || "Album image"}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    className="object-cover"
                    unoptimized={true}
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveImage(image.id)}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium truncate">{image.title || "Untitled"}</p>
                  <p className="text-xs text-muted-foreground">{formatBytes(image.size_in_bytes)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border border-dashed rounded-lg">
            <Images className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No images in this album yet</p>
            <p className="text-sm text-muted-foreground mb-4">Use the bulk upload above or add existing images below</p>
          </div>
        )}

        {/* Available Images to Add */}
        <div id="available-images" className="space-y-4">
          <h2 className="text-xl font-semibold">Add Existing Images ({imagesNotInAlbum.length})</h2>
          
          {imagesNotInAlbum.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {imagesNotInAlbum.map((image) => (
                <div key={image.id} className="group relative overflow-hidden border rounded-lg">
                  <div className="aspect-square relative">
                    <Image
                      src={image.public_url}
                      alt={image.title || "Available image"}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      className="object-cover"
                      unoptimized={true}
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleAddImages([image.id])}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium truncate">{image.title || "Untitled"}</p>
                    <p className="text-xs text-muted-foreground">{formatBytes(image.size_in_bytes)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border border-dashed rounded-lg">
              <p className="text-muted-foreground mb-4">All your existing images are already in this album!</p>
              <p className="text-sm text-muted-foreground">Use the bulk upload above to add new images directly to this album</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 