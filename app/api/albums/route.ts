import { NextRequest, NextResponse } from "next/server"
import { createDirectClient } from "@/lib/supabase/server"
import type { Database } from "@/lib/database.types"

// Initialize Supabase client
const supabase = createDirectClient()

// Helper function to generate unique share code
function generateShareCode(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Helper function to ensure unique share code
async function generateUniqueShareCode(): Promise<string> {
  let shareCode = generateShareCode()
  let attempts = 0
  const maxAttempts = 10
  
  while (attempts < maxAttempts) {
    const { data, error } = await supabase
      .from('albums')
      .select('id')
      .eq('share_code', shareCode)
      .single()
    
    if (error && error.code === 'PGRST116') {
      // No row found, share code is unique
      return shareCode
    }
    
    if (data) {
      // Share code exists, generate a new one
      shareCode = generateShareCode()
      attempts++
    } else {
      // Some other error, but let's use this code
      return shareCode
    }
  }
  
  // Fallback: add timestamp if we can't generate unique after max attempts
  return `${shareCode}_${Date.now().toString(36)}`
}

// GET - List all albums
export async function GET() {
  try {
    const { data: albums, error } = await supabase
      .from('albums')
      .select(`
        *,
        album_images(
          id,
          image_id,
          order_index,
          images(
            id,
            title,
            public_url,
            content_type
          )
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json(
        { error: "Failed to fetch albums" },
        { status: 500 }
      )
    }

    // Transform the data to include image count and preview
    const albumsWithStats = albums?.map(album => ({
      ...album,
      image_count: album.album_images?.length || 0,
      preview_image: album.album_images?.[0]?.images?.public_url || null
    })) || []

    return NextResponse.json({
      success: true,
      albums: albumsWithStats
    })
  } catch (error) {
    console.error("Error fetching albums:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST - Create new album
export async function POST(request: NextRequest) {
  try {
    const { title, description } = await request.json()

    if (!title || title.trim().length === 0) {
      return NextResponse.json(
        { error: "Album title is required" },
        { status: 400 }
      )
    }

    // Generate unique share code
    const shareCode = await generateUniqueShareCode()

    // Create album
    const { data: album, error } = await supabase
      .from('albums')
      .insert({
        title: title.trim(),
        description: description?.trim() || null,
        share_code: shareCode,
        is_public: false // Albums start as private
      })
      .select()
      .single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json(
        { error: "Failed to create album" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      album: {
        ...album,
        image_count: 0,
        preview_image: null
      }
    })
  } catch (error) {
    console.error("Error creating album:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 