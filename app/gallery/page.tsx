import { ImageGrid } from "@/components/image-grid"
import { GalleryActions } from "@/components/gallery-actions"
import { CategoryFilter } from "@/components/category-filter"
import { createDirectClient } from "@/lib/supabase/server"

// Initialize Supabase client
const supabase = createDirectClient()

export const metadata = {
  title: "Gallery",
  description: "Browse and discover images and videos from your vault",
}

export const revalidate = 0 // Allow fresh data from database

interface GalleryPageProps {
  searchParams: Promise<{
    category?: string
    search?: string
  }>
}

export default async function GalleryPage({ searchParams }: GalleryPageProps) {
  const { category: selectedCategory, search } = await searchParams
  
  try {
    // Fetch all media from database
    const { data: allMedia, error: mediaError } = await supabase
      .from('images')
      .select('*')
      .order('created_at', { ascending: false })

    if (mediaError) {
      console.error("Database error:", mediaError)
    }

    const media = allMedia || []

    // Get unique categories from media
    const categoriesSet = new Set<string>()
    media.forEach(item => {
      if (item.category) {
        categoriesSet.add(item.category)
      }
    })
    
    // Convert to array and sort, but keep "uncategorized" first if it exists
    const categories = Array.from(categoriesSet).sort((a, b) => {
      if (a === "uncategorized") return -1
      if (b === "uncategorized") return 1
      return a.toLowerCase().localeCompare(b.toLowerCase())
    })

    // Filter media by category and search term
    let filteredMedia = media

    // Apply category filter
    if (selectedCategory && selectedCategory !== "all") {
      filteredMedia = filteredMedia.filter((item: any) => item.category === selectedCategory)
    }

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase()
      filteredMedia = filteredMedia.filter((item: any) => {
        const titleMatch = item.title?.toLowerCase().includes(searchLower)
        const categoryMatch = item.category?.toLowerCase().includes(searchLower)
        const descriptionMatch = item.description?.toLowerCase().includes(searchLower)
        return titleMatch || categoryMatch || descriptionMatch
      })
    }

    // Count images and videos
    const imageCount = media.filter(item => item.content_type.startsWith('image/')).length
    const videoCount = media.filter(item => item.content_type.startsWith('video/')).length

    return (
      <div className="page-container">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Media Gallery</h1>
            <p className="text-muted-foreground mt-2">
              {search 
                ? `Searching for "${search}"${selectedCategory && selectedCategory !== "all" ? ` in ${selectedCategory}` : ""}`
                : selectedCategory && selectedCategory !== "all" 
                  ? `Showing media in "${selectedCategory}" category`
                  : "Browse all your uploaded images and videos"
              }
            </p>
          </div>
          {media.length > 0 && <GalleryActions />}
        </div>

        {categories.length > 0 && (
          <div className="mb-8">
            <CategoryFilter categories={categories} selectedCategory={selectedCategory} />
          </div>
        )}

        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            ✅ {media.length} total uploads ({imageCount} images, {videoCount} videos), showing {filteredMedia.length}
            {search && ` matching "${search}"`}
            {selectedCategory && selectedCategory !== "all" && ` in "${selectedCategory}"`}
          </p>
        </div>

        {filteredMedia.length > 0 ? (
          <ImageGrid images={filteredMedia} />
        ) : (
          <div className="flex flex-col items-center justify-center p-12 border bg-muted/20">
            <p className="text-muted-foreground text-center">
              {mediaError 
                ? "Unable to load media from database"
                : search
                  ? `No media found matching "${search}"`
                  : selectedCategory && selectedCategory !== "all" 
                    ? `No media found in "${selectedCategory}" category`
                    : "No media uploaded yet"
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
          <h1 className="text-3xl font-bold">Media Gallery</h1>
        </div>
        <div className="flex justify-center p-12 border bg-muted/20">
          <p className="text-muted-foreground text-center">An error occurred while loading the gallery</p>
        </div>
      </div>
    )
  }
}
