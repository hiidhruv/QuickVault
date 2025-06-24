import Link from "next/link"
import Image from "next/image"
import { Eye, Tag } from "lucide-react"
import { formatBytes } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import type { Database } from "@/lib/database.types"

type ImageType = Database["public"]["Tables"]["images"]["Row"]

interface ImageGridProps {
  images: ImageType[]
}

export function ImageGrid({ images }: ImageGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {images.map((image) => {
        const isVideo = image.content_type.startsWith("video/")
        return (
          <Link
            key={image.id}
            href={`/i/${image.id}`}
            className="group relative overflow-hidden border bg-background transition-colors hover:bg-accent"
          >
            {/* Image/Video Container */}
            <div className="aspect-square relative">
              {isVideo ? (
                <video
                  src={image.public_url}
                  controls
                  muted
                  loop
                  autoPlay
                  className="object-cover w-full h-full transition-transform group-hover:scale-105"
                />
              ) : (
                <Image
                  src={image.public_url || "/placeholder.svg"}
                  alt={image.title || "Uploaded image"}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform group-hover:scale-105"
                  unoptimized={true}
                />
              )}
              
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              {/* Category badge */}
              {image.category && (
                <div className="absolute top-2 left-2">
                  <Badge variant="secondary" className="text-xs capitalize bg-black/50 text-white border-white/20">
                    <Tag className="h-3 w-3 mr-1" />
                    {image.category}
                  </Badge>
                </div>
              )}
              
              {/* Hover stats */}
              <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-2 text-white text-xs">
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    <span>{image.view_count}</span>
                  </div>
                  <span>{formatBytes(image.size_in_bytes)}</span>
                </div>
              </div>
            </div>
            
            {/* Title and Description */}
            <div className="p-4 space-y-2">
              <h3 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                {image.title || "Untitled"}
              </h3>
              
              {image.description && (
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {image.description}
                </p>
              )}
              
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                <span>{new Date(image.created_at).toLocaleDateString()}</span>
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  <span>{image.view_count}</span>
                </div>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
