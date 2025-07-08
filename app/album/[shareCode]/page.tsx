import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Image from "next/image"
import { formatBytes } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Calendar, Eye, Film, Image as ImageIcon, Share, ExternalLink } from "lucide-react"
import { createDirectClient } from "@/lib/supabase/server"
import Link from "next/link"

// Initialize Supabase client
const supabase = createDirectClient()

interface PublicAlbumPageProps {
  params: Promise<{
    shareCode: string
  }>
}

// Generate metadata for the album
export async function generateMetadata({ params }: PublicAlbumPageProps): Promise<Metadata> {
  const { shareCode } = await params
  
  try {
    const { data: album } = await supabase
      .from('albums')
      .select('title, description')
      .eq('share_code', shareCode)
      .eq('is_public', true)
      .single()

    return {
      title: album?.title ? `${album.title} - QV Album` : 'QV Album',
      description: album?.description || 'View this shared album on QV',
    }
  } catch {
    return {
      title: 'Album Not Found - QV',
      description: 'The requested album could not be found.',
    }
  }
}

export default async function PublicAlbumPage({ params }: PublicAlbumPageProps) {
  const { shareCode } = await params

  try {
    // Fetch album with images using share code
    const { data: album, error } = await supabase
      .from('albums')
      .select(`
        *,
        album_images(
          id,
          image_id,
          order_index,
          images(
            id,
            title,
            description,
            public_url,
            content_type,
            size_in_bytes,
            created_at
          )
        )
      `)
      .eq('share_code', shareCode)
      .eq('is_public', true)
      .single()

    if (error || !album) {
      notFound()
    }

    // Sort images by order_index
    const sortedImages = album.album_images
      ? album.album_images
          .sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0))
          .map((item: any) => item.images)
          .filter(Boolean)
      : []

    const imageCount = sortedImages.length
    const totalSize = sortedImages.reduce((acc: number, img: any) => acc + (img.size_in_bytes || 0), 0)

    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">{album.title}</h1>
                {album.description && (
                  <p className="text-muted-foreground mt-2 max-w-2xl">{album.description}</p>
                )}
              </div>
              
              {/* Album Stats */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <ImageIcon className="h-4 w-4" />
                  <span>{imageCount} images</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(album.created_at || '').toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Album Info */}
            <div className="mt-4 flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Share className="h-4 w-4" />
                <span>Shared Album</span>
              </div>
              <span>Total size: {formatBytes(totalSize)}</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="container mx-auto px-4 py-8">
          {sortedImages.length > 0 ? (
            <>
              {/* Image Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {sortedImages.map((image: any) => {
                  const isVideo = image.content_type.startsWith("video/")
                  
                  return (
                    <div key={image.id} className="group relative overflow-hidden border bg-background transition-colors hover:bg-accent rounded-lg">
                      {/* Image/Video Container */}
                      <div className="aspect-square relative">
                        {isVideo ? (
                          <div className="relative w-full h-full">
                            <video
                              src={image.public_url}
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
                            {/* Video play overlay */}
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="bg-white/90 rounded-full p-3">
                                <Film className="h-6 w-6 text-black" />
                              </div>
                            </div>
                            {/* Video badge */}
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
                              src={image.public_url || "/placeholder.svg"}
                              alt={image.title || "Album image"}
                              fill
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              className="object-cover transition-transform group-hover:scale-105"
                              unoptimized={true}
                            />
                            {/* Image badge */}
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
                        
                        {/* Click to open */}
                        <Link
                          href={image.public_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute inset-0 z-10"
                        >
                          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="bg-white/90 rounded-full p-2">
                              <ExternalLink className="h-4 w-4 text-black" />
                            </div>
                          </div>
                        </Link>
                        
                        {/* Image info overlay */}
                        <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="text-white text-xs">
                            <span>{formatBytes(image.size_in_bytes)}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Image Title */}
                      <div className="p-4">
                        <h3 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                          {image.title || "Untitled"}
                        </h3>
                        
                        {image.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mt-1">
                            {image.description}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                          <span>{image.created_at ? new Date(image.created_at).toLocaleDateString() : "No date"}</span>
                          <span className="flex items-center gap-1">
                            {isVideo ? <Film className="h-3 w-3" /> : <ImageIcon className="h-3 w-3" />}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 border bg-muted/20 rounded-lg">
              <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                This album is empty
              </p>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t py-6 mt-12">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm text-muted-foreground">
              Powered by QV - QuickVault
            </p>
          </div>
        </footer>
      </div>
    )
  } catch (error) {
    console.error("Error loading album:", error)
    notFound()
  }
} 