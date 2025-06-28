"use client"

import Link from "next/link"
import Image from "next/image"
import { Eye, Tag, Play, Film, Image as ImageIcon } from "lucide-react"
import { formatBytes } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { CopyButton } from "@/components/copy-button"
import { DeleteImageButton } from "@/components/delete-image-button"
import type { Database } from "@/lib/database.types"

type MediaType = Database["public"]["Tables"]["images"]["Row"]

interface MediaGridProps {
  images: MediaType[]
}

export function ImageGrid({ images }: MediaGridProps) {
  return (
    <>
      {/* Mobile List View (phones) */}
      <div className="flex flex-col gap-3 sm:hidden">
        {images.map((media) => {
          const isVideo = media.content_type.startsWith("video/")
          
          return (
            <div key={media.id} className="group flex items-center gap-3 p-3 border bg-background transition-colors hover:bg-accent">
              {/* Left: Thumbnail */}
              <Link href={`/i/${media.id}`} className="flex-shrink-0">
                <div className="w-16 h-16 relative">
                  {isVideo ? (
                    <div className="relative w-full h-full">
                      <video
                        src={media.public_url}
                        muted
                        className="object-cover w-full h-full"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <Play className="h-4 w-4 text-white fill-white" />
                      </div>
                    </div>
                  ) : (
                    <Image
                      src={media.public_url || "/placeholder.svg"}
                      alt={media.title || "Uploaded media"}
                      fill
                      sizes="64px"
                      className="object-cover"
                      unoptimized={true}
                    />
                  )}
                </div>
              </Link>
              
              {/* Center: Content */}
              <Link href={`/i/${media.id}`} className="flex-1 min-w-0">
                <div className="space-y-1">
                  <h3 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                    {media.title || "Untitled"}
                  </h3>
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      <span>{media.view_count}</span>
                    </div>
                    {media.category && (
                      <>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Tag className="h-3 w-3" />
                          <span className="capitalize">{media.category}</span>
                        </div>
                      </>
                    )}
                    <span>•</span>
                    <span>{formatBytes(media.size_in_bytes)}</span>
                  </div>
                  
                  {media.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {media.description}
                    </p>
                  )}
                </div>
              </Link>
              
              {/* Right: Action Buttons */}
              <div className="flex flex-col gap-2 flex-shrink-0">
                <CopyButton 
                  value={media.public_url} 
                  label=""
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                />
                <DeleteImageButton 
                  imageId={media.id}
                  imageTitle={media.title || undefined}
                  variant="destructive"
                  size="icon"
                  className="h-8 w-8"
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Desktop Grid View (tablets and larger) */}
      <div className="hidden sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {images.map((media) => {
          const isVideo = media.content_type.startsWith("video/")
          
          return (
            <div key={media.id} className="group relative overflow-hidden border bg-background transition-colors hover:bg-accent">
              <Link
                href={`/i/${media.id}`}
                className="block"
              >
                {/* Media Container */}
                <div className="aspect-square relative">
                  {isVideo ? (
                    <div className="relative w-full h-full">
                      <video
                        src={media.public_url}
                        muted
                        loop
                        playsInline
                        className="object-cover w-full h-full transition-transform group-hover:scale-105"
                        onMouseEnter={(e) => {
                          const video = e.target as HTMLVideoElement
                          video.play().catch(() => {})
                        }}
                        onMouseLeave={(e) => {
                          const video = e.target as HTMLVideoElement
                          video.pause()
                          video.currentTime = 0
                        }}
                      />
                      {/* Video overlay indicator */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-white/90 rounded-full p-3">
                          <Play className="h-6 w-6 text-black fill-black" />
                        </div>
                      </div>
                      {/* Video type badge */}
                      <div className="absolute top-2 right-2">
                        <Badge variant="secondary" className="text-xs bg-black/70 text-white border-white/20">
                          <Film className="h-3 w-3 mr-1" />
                          Video
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <div className="relative w-full h-full">
                      <Image
                        src={media.public_url || "/placeholder.svg"}
                        alt={media.title || "Uploaded media"}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform group-hover:scale-105"
                        unoptimized={true}
                      />
                      {/* Image type badge */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Badge variant="secondary" className="text-xs bg-black/70 text-white border-white/20">
                          <ImageIcon className="h-3 w-3 mr-1" />
                          Image
                        </Badge>
                      </div>
                    </div>
                  )}
                  
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  {/* Category badge */}
                  {media.category && (
                    <div className="absolute top-2 left-2">
                      <Badge variant="secondary" className="text-xs capitalize bg-black/50 text-white border-white/20">
                        <Tag className="h-3 w-3 mr-1" />
                        {media.category}
                      </Badge>
                    </div>
                  )}
                  
                  {/* Hover stats */}
                  <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-2 text-white text-xs">
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        <span>{media.view_count}</span>
                      </div>
                      <span>{formatBytes(media.size_in_bytes)}</span>
                    </div>
                  </div>
                </div>
                
                {/* Title and Description */}
                <div className="p-4 space-y-2">
                  <h3 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                    {media.title || "Untitled"}
                  </h3>
                  
                  {media.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {media.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                    <span>{media.created_at ? new Date(media.created_at).toLocaleDateString() : "No date"}</span>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        <span>{media.view_count}</span>
                      </div>
                      {isVideo ? (
                        <Film className="h-3 w-3" />
                      ) : (
                        <ImageIcon className="h-3 w-3" />
                      )}
                    </div>
                  </div>
                </div>
              </Link>
              
              {/* Action buttons - outside the Link to prevent navigation */}
              <div className="px-4 pb-4 -mt-2 space-y-2">
                <CopyButton 
                  value={media.public_url} 
                  label="Copy media link"
                  variant="outline"
                  size="sm"
                  className="w-full"
                />
                <DeleteImageButton 
                  imageId={media.id}
                  imageTitle={media.title || undefined}
                  variant="destructive"
                  size="sm"
                  className="w-full"
                />
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
