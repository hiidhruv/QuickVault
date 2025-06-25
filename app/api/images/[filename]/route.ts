import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"

// Initialize Supabase client with environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient<Database>(supabaseUrl, supabaseKey)

interface RouteParams {
  params: Promise<{
    filename: string
  }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { filename } = await params
    
    // Get image from database
    const { data: image, error } = await supabase
      .from('images')
      .select('*')
      .eq('id', filename)
      .single()

    if (error || !image) {
      return NextResponse.json(
        { error: "Image not found" },
        { status: 404 }
      )
    }

    // Increment view count
    await supabase
      .from('images')
      .update({ view_count: (image.view_count || 0) + 1 })
      .eq('id', filename)

    return NextResponse.json({
      success: true,
      image,
      note: "Retrieved from Supabase database"
    })
  } catch (error) {
    console.error("Error fetching image:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
