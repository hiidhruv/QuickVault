import { NextRequest, NextResponse } from "next/server"
import { createDirectClient } from "@/lib/supabase/server"

// Initialize Supabase client
const supabase = createDirectClient()

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

// POST - Add images to album
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: albumId } = await params
    const { imageIds } = await request.json()

    if (!imageIds || !Array.isArray(imageIds) || imageIds.length === 0) {
      return NextResponse.json(
        { error: "Image IDs array is required" },
        { status: 400 }
      )
    }

    // Verify album exists
    const { data: album, error: albumError } = await supabase
      .from('albums')
      .select('id')
      .eq('id', albumId)
      .single()

    if (albumError || !album) {
      return NextResponse.json(
        { error: "Album not found" },
        { status: 404 }
      )
    }

    // Get current max order_index for this album
    const { data: maxOrderData } = await supabase
      .from('album_images')
      .select('order_index')
      .eq('album_id', albumId)
      .order('order_index', { ascending: false })
      .limit(1)

    let nextOrderIndex = (maxOrderData?.[0]?.order_index || 0) + 1

    // Prepare album_images records
    const albumImagesData = imageIds.map((imageId: string) => ({
      album_id: albumId,
      image_id: imageId,
      order_index: nextOrderIndex++
    }))

    // Insert album_images records (will ignore duplicates due to unique constraint)
    const { data: albumImages, error } = await supabase
      .from('album_images')
      .upsert(albumImagesData, { 
        onConflict: 'album_id,image_id',
        ignoreDuplicates: true 
      })
      .select()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json(
        { error: "Failed to add images to album" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      added_count: albumImages?.length || 0,
      message: `Added ${albumImages?.length || 0} images to album`
    })
  } catch (error) {
    console.error("Error adding images to album:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE - Remove images from album
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: albumId } = await params
    const { imageIds } = await request.json()

    if (!imageIds || !Array.isArray(imageIds) || imageIds.length === 0) {
      return NextResponse.json(
        { error: "Image IDs array is required" },
        { status: 400 }
      )
    }

    // Remove images from album
    const { error } = await supabase
      .from('album_images')
      .delete()
      .eq('album_id', albumId)
      .in('image_id', imageIds)

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json(
        { error: "Failed to remove images from album" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Removed ${imageIds.length} images from album`
    })
  } catch (error) {
    console.error("Error removing images from album:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 