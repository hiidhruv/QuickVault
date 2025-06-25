import { ImageGrid } from "@/components/image-grid"
import { GalleryActions } from "@/components/gallery-actions"
import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"

// Initialize Supabase client with environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient<Database>(supabaseUrl, supabaseKey)

export const metadata = {
  title: "Gallery - IHP",
  description: "Browse all uploaded images",
}

export const revalidate = 0 // Allow fresh data from database

interface GalleryPageProps {
  searchParams: Promise<{
    category?: string
  }>
}

export default async function GalleryPage({ searchParams }: GalleryPageProps) {
  const { category: selectedCategory } = await searchParams
  
  try {
    // Fetch all images from database
    const { data: allImages, error: imagesError } = await supabase
      .from('images')
      .select('*')
      .order('created_at', { ascending: false })

    if (imagesError) {
      console.error("Database error:", imagesError)
    }

    const images = allImages || []

    // Get unique categories
    const categories = [...new Set(images.map(img => img.category).filter(Boolean))]

    // Filter images by category if selected
    const filteredImages = selectedCategory && selectedCategory !== "all" 
      ? images.filter((img: any) => img.category === selectedCategory)
      : images

    return (
      <div className="page-container">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Image Gallery</h1>
            <p className="text-muted-foreground mt-2">
              {selectedCategory && selectedCategory !== "all" 
                ? `Showing images in "${selectedCategory}" category`
                : "Browse all your uploaded images"
              }
            </p>
          </div>
          {images.length > 0 && <GalleryActions />}
        </div>

        <div className="mb-8">
          <p className="text-sm text-muted-foreground">
            Categories: {categories.length > 0 ? categories.join(", ") : "None"}
          </p>
        </div>

        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            ✅ Database connected - {images.length} total images, showing {filteredImages.length}
            {selectedCategory && selectedCategory !== "all" && ` in "${selectedCategory}"`}
          </p>
        </div>

        {filteredImages.length > 0 ? (
          <ImageGrid images={filteredImages} />
        ) : (
          <div className="flex flex-col items-center justify-center p-12 border bg-muted/20">
            <p className="text-muted-foreground text-center">
              {imagesError 
                ? "Unable to load images from database"
                : selectedCategory && selectedCategory !== "all" 
                  ? `No images found in "${selectedCategory}" category`
                  : "No images uploaded yet"
              }
            </p>
          </div>
        )}
      </div>
    )
  } catch (error) {
    console.error("Error in gallery page:", error)
    return (
      <div className="page-container">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h1 className="text-3xl font-bold">Image Gallery</h1>
        </div>
        <div className="flex justify-center p-12 border bg-muted/20">
          <p className="text-muted-foreground text-center">An error occurred while loading the gallery</p>
        </div>
      </div>
    )
  }
}
