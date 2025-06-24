import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Image from "next/image"
import { createServerClient } from "@/lib/supabase/server"
import { ImageActions } from "@/components/image-actions"
import { formatBytes } from "@/lib/utils"
import { incrementViewCount } from "@/app/i/[id]/actions"
import { DeleteButton } from "@/components/delete-button"
import { Badge } from "@/components/ui/badge"
import { Tag, Eye, Calendar, FileImage } from "lucide-react"

interface ImagePageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: ImagePageProps): Promise<Metadata> {
  const supabase = createServerClient()

  const { data: image } = await supabase.from("images").select("*").eq("id", params.id).single()

  if (!image) {
    return {
      title: "Image not found",
    }
  }

  return {
    title: "IHP",
    description: " ", // Minimal description for cleaner embeds
    openGraph: {
      images: [image.public_url],
      type: "website",
      title: " ",
      description: " ",
    },
    twitter: {
      images: [image.public_url],
      card: "summary_large_image",
      title: " ",
      description: " ",
    },
  }
}

export default async function ImagePage({ params }: ImagePageProps) {
  const supabase = createServerClient()

  const { data: image } = await supabase.from("images").select("*").eq("id", params.id).single()

  // Add this console log to inspect the entire image object
  console.log("Image data received in ImagePage:", image);

  if (!image) {
    notFound()
  }

  // Increment view count (fire and forget)
  incrementViewCount(params.id)

  // Check if the media is a video
  const isVideo = image.content_type.startsWith("video/")
  console.log(`Debug: Image ID: ${image.id}, Content Type: ${image.content_type}, Is Video: ${isVideo}`);

  return (
    <div className="page-container">
      <div className="max-w-6xl mx-auto">
        <div className="space-y-8">
          {/* Header with title, description and actions */}
          <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">{image.title || "Untitled"}</h1>
                {image.description && (
                  <p className="text-muted-foreground text-lg leading-relaxed max-w-3xl">
                    {image.description}
                  </p>
                )}
              </div>
              
              {/* Metadata badges */}
              <div className="flex flex-wrap gap-3">
                {image.category && (
                  <Badge variant="secondary" className="capitalize">
                    <Tag className="h-3 w-3 mr-1" />
                    {image.category}
                  </Badge>
                )}
                <Badge variant="outline">
                  <Eye className="h-3 w-3 mr-1" />
                  {image.view_count} views
                </Badge>
                <Badge variant="outline">
                  <FileImage className="h-3 w-3 mr-1" />
                  {formatBytes(image.size_in_bytes)}
                </Badge>
                <Badge variant="outline">
                  <Calendar className="h-3 w-3 mr-1" />
                  {new Date(image.created_at).toLocaleDateString()}
                </Badge>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <ImageActions image={image} />
              <DeleteButton imageId={image.id} />
            </div>
          </div>

          {/* Image/Video display */}
          <div className="border bg-muted/20 overflow-hidden">
            <div className="relative">
              <div className="flex items-center justify-center min-h-[50vh] max-h-[80vh] bg-black/5">
                {isVideo ? (
                  <video
                    src={image.public_url}
                    controls
                    className="max-h-[80vh] w-auto object-contain"
                  />
                ) : (
                  <Image
                    src={image.public_url || "/placeholder.svg"}
                    alt={image.title || "Uploaded image"}
                    width={1200}
                    height={800}
                    className="max-h-[80vh] w-auto object-contain"
                    priority
                    unoptimized={true} // Always unoptimized for external Catbox URLs
                  />
                )}
              </div>
            </div>
          </div>

          {/* Bottom info */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Uploaded on {new Date(image.created_at).toLocaleDateString()} at{" "}
              {new Date(image.created_at).toLocaleTimeString()}
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{image.view_count} total views</span>
              <span>Size: {formatBytes(image.size_in_bytes)}</span>
              <span>Type: {image.content_type}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
