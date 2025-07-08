"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Plus, Images } from "lucide-react"
import { AlbumGrid } from "@/components/album-grid"
import { AlbumCreateForm } from "@/components/album-create-form"
import type { Database } from "@/lib/database.types"

type AlbumType = Database["public"]["Tables"]["albums"]["Row"] & {
  image_count: number
  preview_image: string | null
}

export default function AlbumsPage() {
  const [albums, setAlbums] = useState<AlbumType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const { toast } = useToast()

  // Fetch albums
  const fetchAlbums = async () => {
    try {
      const response = await fetch("/api/albums")
      const data = await response.json()
      
      if (data.success) {
        setAlbums(data.albums)
      } else {
        // Check if it's a database table issue
        if (data.error?.includes("relation") || data.error?.includes("table") || data.error?.includes("does not exist")) {
          toast({
            title: "Database Setup Required",
            description: "Album tables need to be created. Check the setup instructions.",
            variant: "destructive",
          })
        } else {
          throw new Error(data.error || "Failed to fetch albums")
        }
      }
    } catch (error) {
      console.error("Error fetching albums:", error)
      toast({
        title: "Error",
        description: "Failed to load albums. Database tables may need to be created.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle album creation success
  const handleAlbumCreated = (newAlbum: AlbumType) => {
    setAlbums(prev => [newAlbum, ...prev])
    setIsCreateDialogOpen(false)
  }



  // Handle album delete
  const handleAlbumDelete = async (album: AlbumType) => {
    if (!confirm(`Are you sure you want to delete "${album.title}"? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/albums/${album.id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        setAlbums(prev => prev.filter(a => a.id !== album.id))
        toast({
          title: "Success",
          description: "Album deleted successfully",
        })
      } else {
        throw new Error(data.error || "Failed to delete album")
      }
    } catch (error) {
      console.error("Error deleting album:", error)
      toast({
        title: "Error",
        description: "Failed to delete album",
        variant: "destructive",
      })
    }
  }

  // Handle toggle public/private
  const handleTogglePublic = async (album: AlbumType) => {
    try {
      const response = await fetch(`/api/albums/${album.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: album.title,
          description: album.description,
          is_public: !album.is_public,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setAlbums(prev =>
          prev.map(a =>
            a.id === album.id
              ? { ...a, is_public: !a.is_public }
              : a
          )
        )
        toast({
          title: "Success",
          description: `Album is now ${!album.is_public ? "public" : "private"}`,
        })
      } else {
        throw new Error(data.error || "Failed to update album")
      }
    } catch (error) {
      console.error("Error updating album:", error)
      toast({
        title: "Error",
        description: "Failed to update album",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    fetchAlbums()
  }, [])

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="flex min-h-screen items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Albums</h1>
          <p className="text-muted-foreground mt-2">
            Create and manage your image albums for easy sharing
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Album
            </Button>
          </DialogTrigger>
          <DialogContent className="p-0 border-0 bg-transparent">
            <DialogTitle className="sr-only">Create New Album</DialogTitle>
            <AlbumCreateForm
              onSuccess={handleAlbumCreated}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">
          ✅ {albums.length} albums created
          {albums.filter(a => a.is_public).length > 0 && (
            <span>, {albums.filter(a => a.is_public).length} public</span>
          )}
        </p>
      </div>

      {/* Albums Grid */}
      {albums.length > 0 ? (
        <AlbumGrid
          albums={albums}
          onDelete={handleAlbumDelete}
          onTogglePublic={handleTogglePublic}
        />
      ) : (
        <div className="flex flex-col items-center justify-center p-12 border bg-muted/20">
          <Images className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-6 text-center">
            No albums created yet
          </p>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg">
                <Plus className="mr-2 h-4 w-4" />
                Create your first album
              </Button>
            </DialogTrigger>
                       <DialogContent className="p-0 border-0 bg-transparent">
             <DialogTitle className="sr-only">Create New Album</DialogTitle>
             <AlbumCreateForm
               onSuccess={handleAlbumCreated}
               onCancel={() => setIsCreateDialogOpen(false)}
             />
           </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  )
} 