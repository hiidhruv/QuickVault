import Link from "next/link"
import Image from "next/image"
import { Eye } from "lucide-react"
import { formatBytes } from "@/lib/utils"
import type { Database } from "@/lib/database.types"

type ImageType = Database["public"]["Tables"]["images"]["Row"]

interface ImageGridProps {
  images: ImageType[]
}

export function ImageGrid({ images }: ImageGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {images.map((image) => {
        const isVideo = image.content_type.startsWith("video/")
        return (
          <Link
            key={image.id}
            href={`/i/${image.id}`}
            className="group relative overflow-hidden border bg-background transition-colors hover:bg-accent"
          >
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
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
              <h3 className="font-medium text-white truncate">{image.title || "Untitled"}</h3>
              <div className="flex items-center mt-1">
                <Eye className="h-3 w-3 text-white/70 mr-1" />
                <span className="text-xs text-white/70">{image.view_count}</span>
                <span className="text-xs text-white/70 ml-auto">{formatBytes(image.size_in_bytes)}</span>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
