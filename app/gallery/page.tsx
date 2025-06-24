import { ImageGrid } from "@/components/image-grid"
import { GalleryActions } from "@/components/gallery-actions"
import { getAllImages, getCategories } from "@/lib/memory-store"

export const metadata = {
  title: "Gallery - IHP",
  description: "Browse all uploaded images",
}

export const revalidate = 0 // Disable caching while using memory storage

interface GalleryPageProps {
  searchParams: Promise<{
    category?: string
  }>
}

export default async function GalleryPage({ searchParams }: GalleryPageProps) {
  const { category: selectedCategory } = await searchParams
  
  try {
    const allImages = getAllImages()
    const categories = getCategories()

    // Filter images by category if selected
    const filteredImages = selectedCategory && selectedCategory !== "all" 
      ? allImages.filter((img: any) => img.category === selectedCategory)
      : allImages

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
          {allImages.length > 0 && <GalleryActions />}
        </div>

        <div className="mb-8">
          <p className="text-sm text-muted-foreground">
            Categories: {categories.length > 0 ? categories.join(", ") : "None"}
          </p>
        </div>

        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            ✅ Memory storage working - {allImages.length} total images, showing {filteredImages.length}
            {selectedCategory && selectedCategory !== "all" && ` in "${selectedCategory}"`}
          </p>
        </div>

        {filteredImages.length > 0 ? (
          <ImageGrid images={filteredImages} />
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
