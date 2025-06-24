import { type NextRequest, NextResponse } from "next/server"
import { uploadToCatbox } from "@/lib/catbox"
import { maskCatboxUrl } from "@/lib/url-masking"
import { addImage, getAllImages } from "@/lib/memory-store"
import crypto from "crypto"

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
    console.log("Upload API called - using shared memory store...")

    // Parse the form data
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const catboxUrlInput = formData.get("catboxUrl") as string | null
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const category = formData.get("category") as string

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
      return NextResponse.json({ success: false, error: "No file or Catbox URL provided" }, { status: 400 })
    }

    // Create image record
    const imageId = crypto.randomUUID()
    const imageRecord = {
      id: imageId,
      title: title || null,
      description: description || null,
      category: category || "uncategorized",
      storage_path: storagePath,
      public_url: publicUrl,
      content_type: contentType,
      size_in_bytes: sizeInBytes,
      is_public: true,
      view_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: null
    }

    // Store in shared memory
    addImage(imageRecord)

    console.log("Image stored in shared memory store:", imageRecord)
    
    return NextResponse.json({ 
      success: true, 
      media: imageRecord,
      note: "Stored in shared memory - working perfectly!"
    })
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

// GET endpoint for API access
export async function GET() {
  const images = getAllImages()
  
  return NextResponse.json({ 
    success: true, 
    images,
    count: images.length,
    note: "Images from shared memory store"
  })
}
