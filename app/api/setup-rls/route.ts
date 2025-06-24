import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

// This endpoint sets up RLS policies for the database tables
export async function POST() {
  try {
    const supabase = createServerComponentClient(
      { cookies },
      {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      },
    )

    // Setup RLS policy for images table
    const { error: imagesError } = await supabase.rpc("setup_public_images_policy")

    if (imagesError) {
      console.error("Error setting up images policy:", imagesError)
    }

    // Setup RLS policy for image_views table
    const { error: viewsError } = await supabase.rpc("setup_public_image_views_policy")

    if (viewsError) {
      console.error("Error setting up image_views policy:", viewsError)
    }

    return NextResponse.json({ 
      success: true, 
      imagesPolicy: !imagesError, 
      viewsPolicy: !viewsError 
    })
  } catch (error) {
    console.error("RLS setup error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
