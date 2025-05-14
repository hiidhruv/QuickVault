import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { uploadToCatbox } from "@/lib/catbox"
import { maskCatboxUrl } from "@/lib/url-masking"

// Maximum file size for serverless functions (4.5MB to be safe)
const MAX_FILE_SIZE = 4.5 * 1024 * 1024

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()

    // Parse the form data
    const formData = await request.formData()
    const file = formData.get("file") as File
    const title = formData.get("title") as string
    const description = formData.get("description") as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 })
    }

    // Check file size for serverless function limit
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large for serverless function. Use direct upload instead." },
        { status: 413 },
      )
    }

    console.log("Uploading file to catbox.moe:", file.name, file.type, `${(file.size / 1024 / 1024).toFixed(2)}MB`)

    // Upload to catbox.moe
    const catboxUrl = await uploadToCatbox(file)

    if (!catboxUrl) {
      return NextResponse.json({ error: "Failed to upload to catbox.moe" }, { status: 500 })
    }

    console.log("File uploaded to catbox.moe:", catboxUrl)

    // Mask the catbox URL with our custom domain
    const maskedUrl = maskCatboxUrl(catboxUrl)

    console.log("Masked URL:", maskedUrl)

    // Save metadata to database
    const { data: imageData, error: dbError } = await supabase
      .from("images")
      .insert({
        title: title || null,
        description: description || null,
        storage_path: catboxUrl, // Store the original catbox URL as the storage path
        public_url: maskedUrl, // Use the masked URL for public display
        content_type: file.type,
        size_in_bytes: file.size,
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
