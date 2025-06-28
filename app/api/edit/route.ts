import { NextRequest, NextResponse } from "next/server"
import { createDirectClient } from "@/lib/supabase/server"

// Initialize Supabase client
const supabase = createDirectClient()

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const imageId = searchParams.get('id')

    if (!imageId) {
      return NextResponse.json(
        { error: "Image ID is required" },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { title, description, category } = body

    // Update the image metadata in the database
    const { data, error } = await supabase
      .from('images')
      .update({
        title: title || null,
        description: description || null,
        category: category || 'uncategorized',
        updated_at: new Date().toISOString()
      })
      .eq('id', imageId)
      .select()
      .single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json(
        { error: "Failed to update image metadata" },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true,
      data: data,
      message: "Image metadata updated successfully" 
    })
  } catch (error) {
    console.error("Edit error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 