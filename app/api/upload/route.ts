import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { uploadToCatbox } from "@/lib/catbox"
import { maskCatboxUrl } from "@/lib/url-masking"

// Maximum file size for serverless functions (4.5MB to be safe)
const MAX_FILE_SIZE = 4.5 * 1024 * 1024

// Helper function to get file metadata from a URL using HEAD request
async function getFileMetadataFromUrl(url: string) {
  let contentType = 'application/octet-stream';
  let sizeInBytes = 0;

  try {
    const response = await fetch(url, { method: 'HEAD' });
    if (response.ok) {
      const headerContentType = response.headers.get('Content-Type');
      const contentLength = response.headers.get('Content-Length');

      if (headerContentType) {
        contentType = headerContentType;
      }
      if (contentLength) {
        sizeInBytes = parseInt(contentLength, 10);
      }
    }
  } catch (error) {
    console.error("Error fetching file metadata via HEAD request:", error);
  }

  // Fallback/refinement: Infer content type from file extension if necessary or more specific
  const urlParts = url.split('.');
  const fileExtension = urlParts.length > 1 ? urlParts.pop()?.toLowerCase() : null;

  if (fileExtension) {
    switch (fileExtension) {
      case 'mp4':
      case 'mov':
      case 'webm':
        contentType = 'video/' + fileExtension;
        break;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
        contentType = 'image/' + fileExtension;
        break;
      default:
        // Keep original contentType or default
        break;
    }
  }

  return {
    contentType,
    sizeInBytes,
  };
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()

    // Parse the form data
    const formData = await request.formData()
    const file = formData.get("file") as File | null // Make file optional
    const catboxUrlInput = formData.get("catboxUrl") as string | null // New input for Catbox URL
    const title = formData.get("title") as string
    const description = formData.get("description") as string

    let storagePath: string
    let publicUrl: string
    let contentType: string
    let sizeInBytes: number

    if (!file && !catboxUrlInput) {
      return NextResponse.json({ success: false, error: "No file or Catbox URL provided" }, { status: 400 })
    }

    if (file) {
      // Existing direct file upload to Catbox.moe
      if (!file.type.startsWith("image/")) {
        return NextResponse.json({ success: false, error: "Invalid file type for direct upload. Only images are allowed." }, { status: 400 })
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { success: false, error: "File too large for serverless function. Use direct upload instead." },
          { status: 413 },
        )
      }

      console.log("Uploading file to catbox.moe:", file.name, file.type, `${(file.size / 1024 / 1024).toFixed(2)}MB`)

      const uploadedCatboxUrl = await uploadToCatbox(file)

      if (!uploadedCatboxUrl) {
        return NextResponse.json({ success: false, error: "Failed to upload to catbox.moe" }, { status: 500 })
      }

      storagePath = uploadedCatboxUrl
      publicUrl = maskCatboxUrl(uploadedCatboxUrl)
      contentType = file.type
      sizeInBytes = file.size
      console.log("File uploaded to catbox.moe and masked:", publicUrl)

    } else if (catboxUrlInput) {
      // New: Process Catbox URL for indexing
      const metadata = await getFileMetadataFromUrl(catboxUrlInput);

      if (!metadata) {
        return NextResponse.json({ success: false, error: "Failed to get metadata from Catbox URL" }, { status: 500 })
      }

      storagePath = catboxUrlInput
      publicUrl = maskCatboxUrl(catboxUrlInput)
      contentType = metadata.contentType
      sizeInBytes = metadata.sizeInBytes
      console.log("Catbox URL processed and masked:", publicUrl)

    } else {
      // This case should ideally be caught by the initial !file && !catboxUrlInput check, but good for robustness
      return NextResponse.json({ success: false, error: "No file or Catbox URL provided" }, { status: 400 })
    }

    // Save metadata to database
    const { data: mediaData, error: dbError } = await supabase
      .from("images")
      .insert({
        title: title || null,
        description: description || null,
        storage_path: storagePath,
        public_url: publicUrl,
        content_type: contentType,
        size_in_bytes: sizeInBytes,
        is_public: true,
      })
      .select()
      .single()

    console.log("Supabase insert result - data:", mediaData);
    console.log("Supabase insert result - error:", dbError);

    if (dbError) {
      console.error("Database error:", dbError)
      return NextResponse.json({ success: false, error: "Failed to save media metadata" }, { status: 500 })
    }

    if (!mediaData) {
      console.error("Media data is undefined after successful database operation.");
      return NextResponse.json({ success: false, error: "Failed to retrieve uploaded media data" }, { status: 500 });
    }
    
    console.log("Returning successful response with media data:", mediaData);
    return NextResponse.json({ success: true, media: mediaData })
  } catch (error) {
    console.error("Server error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
