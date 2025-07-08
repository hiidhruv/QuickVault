import { type NextRequest, NextResponse } from "next/server"
import { uploadToCatbox } from "@/lib/catbox"
import { maskCatboxUrl } from "@/lib/url-masking"
import { createDirectClient } from "@/lib/supabase/server"
import { MAX_FILE_SIZE, SUPPORTED_TYPES } from "@/lib/constants"
import crypto from "crypto"

// Initialize Supabase client
const supabase = createDirectClient()

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
        contentType = 'video/mp4';
        break;
      case 'mov':
        contentType = 'video/mov';
        break;
      case 'webm':
        contentType = 'video/webm';
        break;
      case 'avi':
        contentType = 'video/avi';
        break;
      case 'mkv':
        contentType = 'video/mkv';
        break;
      case 'wmv':
        contentType = 'video/wmv';
        break;
      case 'flv':
        contentType = 'video/flv';
        break;
      case '3gp':
        contentType = 'video/3gp';
        break;
      case 'jpg':
      case 'jpeg':
        contentType = 'image/jpeg';
        break;
      case 'png':
        contentType = 'image/png';
        break;
      case 'gif':
        contentType = 'image/gif';
        break;
      case 'webp':
        contentType = 'image/webp';
        break;
      case 'bmp':
        contentType = 'image/bmp';
        break;
      case 'svg':
        contentType = 'image/svg+xml';
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
    console.log("Upload API called - using Supabase database...")

    // Parse the form data
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const catboxUrlInput = formData.get("catboxUrl") as string | null
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const category = formData.get("category") as string
    const albumId = formData.get("albumId") as string | null

    let storagePath: string
    let publicUrl: string
    let contentType: string
    let sizeInBytes: number

    if (!file && !catboxUrlInput) {
      return NextResponse.json({ success: false, error: "No file or Catbox URL provided" }, { status: 400 })
    }

    if (file) {
      // Check if file type is supported
      const isSupported = (SUPPORTED_TYPES as readonly string[]).some(type => file.type === type) || 
                         file.type.startsWith("image/") || 
                         file.type.startsWith("video/")
      
      if (!isSupported) {
        return NextResponse.json({ 
          success: false, 
          error: "Invalid file type. Only images and videos are supported." 
        }, { status: 400 })
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

    // Create media record in Supabase database
    const mediaId = crypto.randomUUID()
    const { data: mediaRecord, error: dbError } = await supabase
      .from('images') // Keep the same table name for now to avoid breaking changes
      .insert({
        id: mediaId,
        title: title || null,
        description: description || null,
        category: category || "uncategorized",
        storage_path: storagePath,
        public_url: publicUrl,
        content_type: contentType,
        size_in_bytes: sizeInBytes,
        is_public: true,
        view_count: 0,
        user_id: null
      })
      .select()
      .single()

    if (dbError) {
      console.error("Database error:", dbError)
      return NextResponse.json({ 
        success: false, 
        error: "Database error", 
        details: dbError.message 
      }, { status: 500 })
    }

    console.log("Media stored in database:", mediaRecord)

    // If albumId is provided, add the image to the album
    if (albumId) {
      try {
        // Get current max order_index for this album
        const { data: maxOrderData } = await supabase
          .from('album_images')
          .select('order_index')
          .eq('album_id', albumId)
          .order('order_index', { ascending: false })
          .limit(1)

        const nextOrderIndex = (maxOrderData?.[0]?.order_index || 0) + 1

        // Add image to album
        const { error: albumError } = await supabase
          .from('album_images')
          .insert({
            album_id: albumId,
            image_id: mediaRecord.id,
            order_index: nextOrderIndex
          })

        if (albumError) {
          console.error("Error adding image to album:", albumError)
          // Don't fail the upload, just log the error
        } else {
          console.log("Image added to album:", albumId)
        }
      } catch (albumError) {
        console.error("Error adding image to album:", albumError)
        // Don't fail the upload, just log the error
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      media: mediaRecord,
      addedToAlbum: !!albumId,
      note: albumId 
        ? "Successfully stored in database and added to album!" 
        : "Successfully stored in database - accessible from anywhere!"
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
  try {
    const { data: media, error } = await supabase
      .from('images') // Keep the same table name for now
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ 
        success: false, 
        error: "Database error", 
        details: error.message 
      }, { status: 500 })
    }
    
    return NextResponse.json({ 
      success: true, 
      media: media || [],
      count: media?.length || 0,
      note: "Media from Supabase database"
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
