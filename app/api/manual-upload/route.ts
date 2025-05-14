import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { maskCatboxUrl } from "@/lib/url-masking"

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()

    // Parse the JSON data
    const { url, title, description } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "No URL provided" }, { status: 400 })
    }

    // Validate that it's a catbox.moe URL
    if (!url.includes("catbox.moe")) {
      return NextResponse.json({ error: "Invalid URL. Only catbox.moe URLs are supported" }, { status: 400 })
    }

    // Mask the catbox URL with our custom domain
    const maskedUrl = maskCatboxUrl(url)

    // Try to determine content type from URL extension
    const fileExtension = url.split(".").pop()?.toLowerCase()
    let contentType = "image/jpeg" // Default

    if (fileExtension === "png") contentType = "image/png"
    else if (fileExtension === "gif") contentType = "image/gif"
    else if (fileExtension === "webp") contentType = "image/webp"
    else if (fileExtension === "jpg" || fileExtension === "jpeg") contentType = "image/jpeg"

    // Estimate file size (we can't know for sure without downloading)
    // This is just a placeholder value
    const estimatedSize = 1024 * 1024 // 1MB placeholder

    // Save metadata to database
    const { data: imageData, error: dbError } = await supabase
      .from("images")
      .insert({
        title: title || null,
        description: description || null,
        storage_path: url, // Store the original catbox URL as the storage path
        public_url: maskedUrl, // Use the masked URL for public display
        content_type: contentType,
        size_in_bytes: estimatedSize,
        is_public: true,
      })
      .select()
      .single()

    if (dbError) {
      console.error("Database error:", dbError)
      return NextResponse.json({ error: "Failed to save image metadata" }, { status: 500 })
    }

    return NextResponse.json({ success: true, image: imageData })
  } catch (error) {
    console.error("Server error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
