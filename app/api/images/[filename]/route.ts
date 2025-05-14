import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: { filename: string } }) {
  const filename = params.filename

  if (!filename) {
    return new NextResponse("Filename is required", { status: 400 })
  }

  try {
    const supabase = createServerClient()

    // Get the file data from Supabase Storage
    const { data, error } = await supabase.storage.from("images").download(filename)

    if (error || !data) {
      console.error("Error fetching image:", error)
      return new NextResponse("Image not found", { status: 404 })
    }

    // Convert the file to a blob
    const blob = new Blob([data])

    // Determine content type based on file extension
    const fileExt = filename.split(".").pop()?.toLowerCase()
    let contentType = "image/jpeg" // Default

    // More precise content type mapping
    if (fileExt === "png") contentType = "image/png"
    else if (fileExt === "gif") contentType = "image/gif"
    else if (fileExt === "webp") contentType = "image/webp"
    else if (fileExt === "svg") contentType = "image/svg+xml"
    else if (fileExt === "jpg" || fileExt === "jpeg") contentType = "image/jpeg"
    else if (fileExt === "bmp") contentType = "image/bmp"
    else if (fileExt === "tiff" || fileExt === "tif") contentType = "image/tiff"
    else if (fileExt === "ico") contentType = "image/x-icon"

    // Try to get the content type from the database for more accuracy
    const { data: imageData } = await supabase
      .from("images")
      .select("content_type")
      .eq("storage_path", filename)
      .single()

    // If we have the content type in the database, use that
    if (imageData?.content_type) {
      contentType = imageData.content_type
    }

    // Return the image with appropriate headers
    return new NextResponse(blob, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable", // Cache for 1 year
      },
    })
  } catch (error) {
    console.error("Error serving image:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
