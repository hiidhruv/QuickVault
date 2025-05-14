import { createServerClient } from "@/lib/supabase/server"
import { ImageGrid } from "@/components/image-grid"
import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"
import Link from "next/link"

export const revalidate = 60 // Revalidate this page every 60 seconds

export default async function Home() {
  const supabase = createServerClient()

  const { data: images, error } = await supabase
    .from("images")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(12)

  return (
    <div className="container py-8">
      <div className="flex flex-col items-center justify-center space-y-4 text-center py-8 md:py-12">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Simple Image Hosting & Sharing</h1>
        <p className="max-w-[700px] text-muted-foreground md:text-xl">
          Upload, share, and embed your images anywhere on the web.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/upload">
            <Button size="lg">
              <Upload className="mr-2 h-4 w-4" />
              Upload Image
            </Button>
          </Link>
          <Link href="/gallery">
            <Button variant="outline" size="lg">
              Browse Gallery
            </Button>
          </Link>
        </div>
      </div>

      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Recent Uploads</h2>
          <Link href="/gallery">
            <Button variant="ghost">View all</Button>
          </Link>
        </div>

        {error ? (
          <div className="flex justify-center p-8">
            <p className="text-muted-foreground">Failed to load images</p>
          </div>
        ) : images && images.length > 0 ? (
          <ImageGrid images={images} />
        ) : (
          <div className="flex flex-col items-center justify-center p-8 border">
            <p className="text-muted-foreground mb-4">No images uploaded yet</p>
            <Link href="/upload">
              <Button>
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
