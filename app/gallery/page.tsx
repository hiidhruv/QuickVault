import { createServerClient } from "@/lib/supabase/server"
import { ImageGrid } from "@/components/image-grid"
import { GalleryActions } from "@/components/gallery-actions"

export const metadata = {
  title: "Gallery - IHP",
  description: "Browse all uploaded images",
}

export const revalidate = 60 // Revalidate this page every 60 seconds

export default async function GalleryPage() {
  const supabase = createServerClient()

  try {
    const { data: images, error } = await supabase
      .from("images")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50)

    if (error) {
      console.error("Error fetching images:", error)
      return (
        <div className="container py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Image Gallery</h1>
          </div>
          <div className="flex justify-center p-8">
            <p className="text-muted-foreground">Failed to load images: {error.message}</p>
          </div>
        </div>
      )
    }

    return (
      <div className="container py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Image Gallery</h1>
          {images && images.length > 0 && <GalleryActions />}
        </div>

        {images && images.length > 0 ? (
          <ImageGrid images={images} />
        ) : (
          <div className="flex justify-center p-8 border">
            <p className="text-muted-foreground">No images uploaded yet</p>
          </div>
        )}
      </div>
    )
  } catch (error) {
    console.error("Error in gallery page:", error)
    return (
      <div className="container py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Image Gallery</h1>
        </div>
        <div className="flex justify-center p-8">
          <p className="text-muted-foreground">An error occurred while loading the gallery</p>
        </div>
      </div>
    )
  }
}
