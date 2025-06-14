import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Image from "next/image"
import { createServerClient } from "@/lib/supabase/server"
import { ImageActions } from "@/components/image-actions"
import { formatBytes } from "@/lib/utils"
import { incrementViewCount } from "@/app/i/[id]/actions"
import { DeleteButton } from "@/components/delete-button"

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
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold">{image.title || "Untitled"}</h1>
              {image.description && <p className="text-muted-foreground mt-1">{image.description}</p>}
            </div>
            <ImageActions image={image} />
          </div>

          <div className="border overflow-hidden bg-background">
            <div className="relative">
              <div className="aspect-auto max-h-[80vh] flex items-center justify-center bg-black/5">
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

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div>Uploaded {new Date(image.created_at).toLocaleDateString()}</div>
            <div className="flex items-center gap-4">
              <div>{image.view_count} views</div>
              <div>{formatBytes(image.size_in_bytes)}</div>
            </div>
          </div>

          <div className="flex justify-end">
            <DeleteButton imageId={image.id} />
          </div>
        </div>
      </div>
    </div>
  )
}
