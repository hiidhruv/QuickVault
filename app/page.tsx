import { ImageGrid } from "@/components/image-grid"
import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"
import Link from "next/link"
import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"

// Initialize Supabase client with environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient<Database>(supabaseUrl, supabaseKey)

export const revalidate = 0 // Allow fresh data from database

export default async function Home() {
  // Fetch media from database
  const { data: media, error } = await supabase
    .from('images')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(12)

  const recentMedia = media || []

  if (error) {
    console.error("Database error:", error)
  }

  return (
    <div className="page-container">
      <div className="flex flex-col items-center justify-center space-y-6 text-center py-12 md:py-16">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl max-w-4xl">
          Simple Media Hosting & Sharing
        </h1>
        <p className="max-w-[700px] text-muted-foreground text-lg md:text-xl leading-relaxed">
          Upload, share, and organize your images and videos by categories anywhere on the web.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Link href="/upload">
            <Button size="lg" className="w-full sm:w-auto">
              <Upload className="mr-2 h-4 w-4" />
              Upload Media
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

        {recentMedia.length > 0 ? (
          <>
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">
                ✅ Database connected - {recentMedia.length} recent uploads found
              </p>
            </div>
            <ImageGrid images={recentMedia} />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 border bg-muted/20">
            <p className="text-muted-foreground mb-6 text-center">
              {error ? "Unable to load media from database" : "No media uploaded yet"}
            </p>
            <Link href="/upload">
              <Button size="lg">
                <Upload className="mr-2 h-4 w-4" />
                Upload your first file
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
