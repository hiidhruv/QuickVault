import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { isCatboxUrl } from "@/lib/catbox"

export async function DELETE() {
  try {
    const supabase = createServerClient()

    // Get all images
    const { data: images, error: fetchError } = await supabase.from("images").select("id, storage_path")

    if (fetchError) {
      console.error("Failed to fetch images:", fetchError)
      return NextResponse.json({ success: false, error: "Failed to fetch images" }, { status: 500 })
    }

    if (!images || images.length === 0) {
      return NextResponse.json({ success: true, count: 0, message: "No images to delete" })
    }

    // Delete files from Supabase storage (if any)
    const supabaseStoragePaths = images
      .filter((image) => !isCatboxUrl(image.storage_path))
      .map((image) => image.storage_path)

    if (supabaseStoragePaths.length > 0) {
      const { error: storageError } = await supabase.storage.from("images").remove(supabaseStoragePaths)

      if (storageError) {
        console.error("Failed to delete from storage:", storageError)
        // Continue with database deletion even if storage deletion fails
      }
    }

    // Delete all image views
    const { error: viewsError } = await supabase
      .from("image_views")
      .delete()
      .in(
        "image_id",
        images.map((image) => image.id),
      )

    if (viewsError) {
      console.error("Failed to delete image views:", viewsError)
      // Continue with deletion even if views deletion fails
    }

    // Delete all images from database
    const { error: dbError } = await supabase
      .from("images")
      .delete()
      .in(
        "id",
        images.map((image) => image.id),
      )

    if (dbError) {
      console.error("Failed to delete from database:", dbError)
      return NextResponse.json({ success: false, error: "Failed to delete images from database" }, { status: 500 })
    }

    // Revalidate paths to update UI
    revalidatePath("/")
    revalidatePath("/gallery")

    return NextResponse.json({
      success: true,
      count: images.length,
      message: `Successfully deleted ${images.length} images`,
    })
  } catch (error) {
    console.error("Failed to delete all images:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete images",
      },
      { status: 500 },
    )
  }
}
