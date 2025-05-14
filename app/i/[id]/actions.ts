"use server"

import { headers } from "next/headers"
import { createActionClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { isCatboxUrl } from "@/lib/catbox"

export async function incrementViewCount(imageId: string) {
  const supabase = createActionClient()

  try {
    // Get client info
    const headersList = headers()
    const userAgent = headersList.get("user-agent") || null
    const ip = headersList.get("x-forwarded-for") || null

    // Record the view
    await supabase.from("image_views").insert({
      image_id: imageId,
      ip_address: ip,
      user_agent: userAgent,
    })

    // Increment the view count using our database function
    await supabase
      .from("images")
      .update({ view_count: supabase.rpc("increment", { row_id: imageId }) })
      .eq("id", imageId)
  } catch (error) {
    console.error("Failed to record view:", error)
  }
}

export async function deleteImage(imageId: string) {
  const supabase = createActionClient()

  try {
    // Get the image data first
    const { data: image, error: fetchError } = await supabase
      .from("images")
      .select("storage_path, public_url")
      .eq("id", imageId)
      .single()

    if (fetchError || !image) {
      console.error("Failed to fetch image:", fetchError)
      throw new Error("Image not found")
    }

    // For catbox.moe URLs, we can't delete the image from their servers
    // We can only remove it from our database
    if (!isCatboxUrl(image.storage_path)) {
      // This is a Supabase storage path, try to delete from storage
      const { error: storageError } = await supabase.storage.from("images").remove([image.storage_path])

      if (storageError) {
        console.error("Failed to delete from storage:", storageError)
        // Continue with deletion even if storage deletion fails
      }
    }

    // Delete image views
    const { error: viewsError } = await supabase.from("image_views").delete().eq("image_id", imageId)

    if (viewsError) {
      console.error("Failed to delete image views:", viewsError)
      // Continue with deletion even if views deletion fails
    }

    // Delete from database
    const { error: dbError } = await supabase.from("images").delete().eq("id", imageId)

    if (dbError) {
      console.error("Failed to delete from database:", dbError)
      throw new Error("Failed to delete image from database")
    }

    // Revalidate paths to update UI
    revalidatePath("/")
    revalidatePath("/gallery")

    return { success: true }
  } catch (error) {
    console.error("Failed to delete image:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete image",
    }
  }
}
