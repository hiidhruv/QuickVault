import { ImageGrid } from "@/components/image-grid"
import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"
import Link from "next/link"
import { getAllImages } from "@/lib/memory-store"

export const revalidate = 0 // Disable caching while using memory storage

export default async function Home() {
  const images = getAllImages()
  const recentImages = images.slice(0, 12) // Show last 12 images

  return (
    <div className="page-container">
      <div className="flex flex-col items-center justify-center space-y-6 text-center py-12 md:py-16">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl max-w-4xl">
          Simple Image Hosting & Sharing
        </h1>
        <p className="max-w-[700px] text-muted-foreground text-lg md:text-xl leading-relaxed">
          Upload, share, and organize your images by categories anywhere on the web.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Link href="/upload">
            <Button size="lg" className="w-full sm:w-auto">
              <Upload className="mr-2 h-4 w-4" />
              Upload Image
            </Button>
          </Link>
          <Link href="/gallery">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Browse Gallery
            </Button>
          </Link>
        </div>
      </div>

      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-2xl font-bold tracking-tight">Recent Uploads</h2>
          <Link href="/gallery">
            <Button variant="ghost" className="w-full sm:w-auto">View all</Button>
          </Link>
        </div>

        {recentImages.length > 0 ? (
          <>
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">
                ✅ Memory storage working - {images.length} images stored
              </p>
            </div>
            <ImageGrid images={recentImages} />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 border bg-muted/20">
            <p className="text-muted-foreground mb-6 text-center">No images uploaded yet</p>
            <Link href="/upload">
              <Button size="lg">
                <Upload className="mr-2 h-4 w-4" />
                Upload your first image
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
