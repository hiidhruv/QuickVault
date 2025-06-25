import { type NextRequest, NextResponse } from "next/server"
import { uploadToCatbox } from "@/lib/catbox"
import { maskCatboxUrl } from "@/lib/url-masking"
import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import crypto from "crypto"

// Initialize Supabase client with environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient<Database>(supabaseUrl, supabaseKey)

// Maximum file size for serverless functions (4.5MB to be safe)
const MAX_FILE_SIZE = 4.5 * 1024 * 1024

// Supported file types
const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/svg+xml']
const SUPPORTED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/mov', 'video/avi', 'video/mkv', 'video/wmv', 'video/flv', 'video/3gp']
const SUPPORTED_TYPES = [...SUPPORTED_IMAGE_TYPES, ...SUPPORTED_VIDEO_TYPES]

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

    let storagePath: string
    let publicUrl: string
    let contentType: string
    let sizeInBytes: number

    if (!file && !catboxUrlInput) {
      return NextResponse.json({ success: false, error: "No file or Catbox URL provided" }, { status: 400 })
    }

    if (file) {
      // Check if file type is supported
      const isSupported = SUPPORTED_TYPES.some(type => file.type === type) || 
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
    
    return NextResponse.json({ 
      success: true, 
      media: mediaRecord,
      note: "Successfully stored in database - accessible from anywhere!"
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
