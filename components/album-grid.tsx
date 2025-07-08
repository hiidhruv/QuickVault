"use client"

import Link from "next/link"
import Image from "next/image"
import { Eye, Share, Images, Calendar, ExternalLink, Trash2, Edit, Settings } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { CopyButton } from "@/components/copy-button"
import type { Database } from "@/lib/database.types"

type AlbumType = Database["public"]["Tables"]["albums"]["Row"] & {
  image_count: number
  preview_image: string | null
}

interface AlbumGridProps {
  albums: AlbumType[]
  onEdit?: (album: AlbumType) => void
  onDelete?: (album: AlbumType) => void
  onTogglePublic?: (album: AlbumType) => void
}

export function AlbumGrid({ albums, onEdit, onDelete, onTogglePublic }: AlbumGridProps) {
  const getShareUrl = (shareCode: string) => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/album/${shareCode}`
    }
    return `/album/${shareCode}`
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {albums.map((album) => (
        <Card key={album.id} className="group overflow-hidden transition-all hover:shadow-md">
          <CardHeader className="p-0">
            {/* Album Preview */}
            <div className="aspect-video relative overflow-hidden bg-muted">
              {album.preview_image ? (
                <Image
                  src={album.preview_image}
                  alt={album.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform group-hover:scale-105"
                  unoptimized={true}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Images className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
              
              {/* Status Badge */}
              <div className="absolute top-2 right-2">
                <Badge variant={album.is_public ? "default" : "secondary"}>
                  {album.is_public ? "Public" : "Private"}
                </Badge>
              </div>
              
              {/* Image Count Badge */}
              <div className="absolute bottom-2 left-2">
                <Badge variant="secondary" className="bg-black/70 text-white">
                  <Images className="h-3 w-3 mr-1" />
                  {album.image_count}
                </Badge>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-lg line-clamp-1">{album.title}</h3>
              
              {album.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {album.description}
                </p>
              )}
              
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(album.created_at || '').toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Images className="h-3 w-3" />
                  <span>{album.image_count} images</span>
                </div>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="p-4 pt-0 space-y-2">
            {/* Share Link (only for public albums) */}
            {album.is_public && (
              <div className="w-full">
                <CopyButton
                  value={getShareUrl(album.share_code)}
                  label="Copy share link"
                  variant="outline"
                  size="sm"
                  className="w-full"
                />
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex gap-2 w-full">
                             {/* Manage Album */}
               <Button
                 variant="outline"
                 size="sm"
                 className="flex-1"
                 asChild
               >
                 <Link href={`/albums/${album.id}`}>
                   <Settings className="h-4 w-4 mr-1" />
                   Manage
                 </Link>
               </Button>
              
              {/* Toggle Public/Private */}
              {onTogglePublic && (
                <Button
                  variant={album.is_public ? "secondary" : "default"}
                  size="sm"
                  className="flex-1"
                  onClick={() => onTogglePublic(album)}
                >
                  <Share className="h-4 w-4 mr-1" />
                  {album.is_public ? "Make Private" : "Make Public"}
                </Button>
              )}
              
              {/* View Album (public only) */}
              {album.is_public && (
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                >
                  <Link href={`/album/${album.share_code}`} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </Button>
              )}
              
              {/* Delete Album */}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => onDelete(album)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
} 