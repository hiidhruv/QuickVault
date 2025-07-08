import { NextRequest, NextResponse } from "next/server"
import { createDirectClient } from "@/lib/supabase/server"

// Initialize Supabase client
const supabase = createDirectClient()

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

// GET - Get album details with images
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    const { data: album, error } = await supabase
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
            description,
            public_url,
            content_type,
            size_in_bytes,
            created_at
          )
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json(
        { error: "Album not found" },
        { status: 404 }
      )
    }

    // Sort images by order_index
    if (album.album_images) {
      album.album_images.sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0))
    }

    return NextResponse.json({
      success: true,
      album
    })
  } catch (error) {
    console.error("Error fetching album:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PUT - Update album
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const { title, description, is_public } = await request.json()

    if (!title || title.trim().length === 0) {
      return NextResponse.json(
        { error: "Album title is required" },
        { status: 400 }
      )
    }

    const { data: album, error } = await supabase
      .from('albums')
      .update({
        title: title.trim(),
        description: description?.trim() || null,
        is_public: is_public ?? false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json(
        { error: "Failed to update album" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      album
    })
  } catch (error) {
    console.error("Error updating album:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE - Delete album
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    // Delete album (album_images will be deleted automatically due to CASCADE)
    const { error } = await supabase
      .from('albums')
      .delete()
      .eq('id', id)

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json(
        { error: "Failed to delete album" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Album deleted successfully"
    })
  } catch (error) {
    console.error("Error deleting album:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 