import { createServerClient } from "@/lib/supabase/server"
import { ImageGrid } from "@/components/image-grid"
import { GalleryActions } from "@/components/gallery-actions"
import { CategoryFilter } from "@/components/category-filter"

export const metadata = {
  title: "Gallery - IHP",
  description: "Browse all uploaded images",
}

export const revalidate = 60 // Revalidate this page every 60 seconds

interface GalleryPageProps {
  searchParams: {
    category?: string
  }
}

export default async function GalleryPage({ searchParams }: GalleryPageProps) {
  const supabase = createServerClient()
  const selectedCategory = searchParams.category

  try {
    // Get distinct categories for filter
    const { data: categoriesData } = await supabase
      .from("images")
      .select("category")
      .not("category", "is", null)

    const validCategories = categoriesData?.map(item => item.category).filter(cat => cat !== null) || []
    const categories = [...new Set(validCategories)]

    // Build query for images
    let query = supabase
      .from("images")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50)

    // Apply category filter if selected
    if (selectedCategory && selectedCategory !== "all") {
      query = query.eq("category", selectedCategory)
    }

    const { data: images, error } = await query

    if (error) {
      console.error("Error fetching images:", error)
      return (
        <div className="page-container">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <h1 className="text-3xl font-bold">Image Gallery</h1>
          </div>
          <div className="flex justify-center p-12 border bg-muted/20">
            <p className="text-muted-foreground text-center">Failed to load images: {error.message}</p>
          </div>
        </div>
      )
    }

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
          {images && images.length > 0 && <GalleryActions />}
        </div>

        <div className="mb-8">
          <CategoryFilter categories={categories} selectedCategory={selectedCategory} />
        </div>

        {images && images.length > 0 ? (
          <>
            <div className="mb-6">
              <p className="text-sm text-muted-foreground">
                Showing {images.length} image{images.length === 1 ? '' : 's'}
                {selectedCategory && selectedCategory !== "all" && ` in "${selectedCategory}"`}
              </p>
            </div>
            <ImageGrid images={images} />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 border bg-muted/20">
            <p className="text-muted-foreground text-center">
              {selectedCategory && selectedCategory !== "all" 
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
