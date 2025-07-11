import { NextRequest, NextResponse } from "next/server"
import { createDirectClient } from "@/lib/supabase/server"

// Initialize Supabase client
const supabase = createDirectClient()

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const imageId = searchParams.get('id')

    if (!imageId) {
      return NextResponse.json(
        { error: "Image ID is required" },
        { status: 400 }
      )
    }

    // Delete the image from the database
    const { error } = await supabase
      .from('images')
      .delete()
      .eq('id', imageId)

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json(
        { error: "Failed to delete image from database" },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true,
      message: "Image deleted successfully" 
    })
  } catch (error) {
    console.error("Delete error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 