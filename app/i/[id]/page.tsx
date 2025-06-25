import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Image from "next/image"
import { formatBytes } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Tag, Eye, Calendar, FileImage, Film, Play } from "lucide-react"
import { ImageCopyButton } from "@/components/image-copy-button"
import { DeleteImageButton } from "@/components/delete-image-button"
import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"

// Initialize Supabase client with environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient<Database>(supabaseUrl, supabaseKey)

interface MediaPageProps {
  params: Promise<{
    id: string
  }>
}

async function getMediaById(id: string) {
  const { data: media, error } = await supabase
    .from('images')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !media) {
    return null
  }

  return media
}

export async function generateMetadata({ params }: MediaPageProps): Promise<Metadata> {
  const { id } = await params
  const media = await getMediaById(id)

  if (!media) {
    return {
      title: "Media not found",
    }
  }

  const isVideo = media.content_type.startsWith("video/")
  
  return {
    title: "IHP",
    description: " ", // Minimal description for cleaner embeds
    openGraph: {
      images: isVideo ? [] : [media.public_url],
      videos: isVideo ? [{ url: media.public_url, type: media.content_type }] : [],
      type: "website",
      title: " ",
      description: " ",
    },
    twitter: {
      images: isVideo ? [] : [media.public_url],
      card: isVideo ? "player" : "summary_large_image",
      title: " ",
      description: " ",
      ...(isVideo && {
        player: {
          url: media.public_url,
          width: 1200,
          height: 675,
        }
      })
    },
  }
}

export default async function MediaPage({ params }: MediaPageProps) {
  const { id } = await params
  const media = await getMediaById(id)

  if (!media) {
    notFound()
  }

  // Increment view count
  await supabase
    .from('images')
    .update({ view_count: (media.view_count || 0) + 1 })
    .eq('id', id)

  // Check if the media is a video
  const isVideo = media.content_type.startsWith("video/")

  return (
    <div className="page-container">
      <div className="max-w-6xl mx-auto">
        <div className="space-y-8">
          {/* Header with title, description and actions */}
          <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold tracking-tight">{media.title || "Untitled"}</h1>
                  {isVideo ? (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      <Film className="h-3 w-3 mr-1" />
                      Video
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <FileImage className="h-3 w-3 mr-1" />
                      Image
                    </Badge>
                  )}
                </div>
                {media.description && (
                  <p className="text-muted-foreground text-lg leading-relaxed max-w-3xl">
                    {media.description}
                  </p>
                )}
              </div>
              
              {/* Metadata badges */}
              <div className="flex flex-wrap gap-3">
                {media.category && (
                  <Badge variant="secondary" className="capitalize">
                    <Tag className="h-3 w-3 mr-1" />
                    {media.category}
                  </Badge>
                )}
                <Badge variant="outline">
                  <Eye className="h-3 w-3 mr-1" />
                  {media.view_count} views
                </Badge>
                <Badge variant="outline">
                  {isVideo ? (
                    <Film className="h-3 w-3 mr-1" />
                  ) : (
                    <FileImage className="h-3 w-3 mr-1" />
                  )}
                  {formatBytes(media.size_in_bytes)}
                </Badge>
                <Badge variant="outline">
                  <Calendar className="h-3 w-3 mr-1" />
                  {media.created_at ? new Date(media.created_at).toLocaleDateString() : "No date"}
                </Badge>
                <Badge variant="outline" className="bg-green-100 text-green-800">
                  ✅ Database Connected
                </Badge>
              </div>
            </div>
            
            {/* Copy and Delete buttons */}
            <div className="flex gap-2">
              <ImageCopyButton id={id} />
              <DeleteImageButton 
                imageId={id}
                imageTitle={media.title || undefined}
                variant="destructive"
                size="default"
                redirectAfterDelete={true}
              />
            </div>
          </div>

          {/* Media display */}
          <div className="border bg-muted/20 overflow-hidden">
            <div className="relative">
              <div className="flex items-center justify-center min-h-[50vh] max-h-[80vh] bg-black/5">
                {isVideo ? (
                  <div className="relative w-full">
                    <video
                      src={media.public_url}
                      controls
                      preload="metadata"
                      className="max-h-[80vh] w-full object-contain"
                      poster={media.public_url + "#t=0.5"}
                    >
                      Your browser does not support the video tag.
                    </video>
                    {/* Video info overlay */}
                    <div className="absolute top-4 left-4 bg-black/80 text-white px-3 py-2 rounded-lg backdrop-blur-sm">
                      <div className="flex items-center gap-2 text-sm">
                        <Play className="h-4 w-4" />
                        <span>{media.content_type.split('/')[1].toUpperCase()}</span>
                        <span>•</span>
                        <span>{formatBytes(media.size_in_bytes)}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Image
                    src={media.public_url || "/placeholder.svg"}
                    alt={media.title || "Uploaded media"}
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
              Uploaded on {media.created_at ? new Date(media.created_at).toLocaleDateString() : "Unknown date"} at{" "}
              {media.created_at ? new Date(media.created_at).toLocaleTimeString() : "Unknown time"}
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{media.view_count} total views</span>
              <span>Size: {formatBytes(media.size_in_bytes)}</span>
              <span>Type: {media.content_type}</span>
              {isVideo && (
                <span>Format: {media.content_type.split('/')[1].toUpperCase()}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
