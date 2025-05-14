import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

// This endpoint sets up RLS policies for the database tables
export async function GET() {
  try {
    // Use direct connection with service role key for admin operations
    const supabase = createServerComponentClient(
      { cookies },
      {
        supabaseUrl: process.env.SUPABASE_URL,
        supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY, // Use service role key for admin operations
      },
    )

    // Call the setup functions we just created
    const { error: imagesError } = await supabase.rpc("setup_public_images_policy")

    if (imagesError) {
      console.error("Error setting up images policy:", imagesError)
      return NextResponse.json({ error: imagesError.message }, { status: 500 })
    }

    const { error: viewsError } = await supabase.rpc("setup_public_image_views_policy")

    if (viewsError) {
      console.error("Error setting up image views policy:", viewsError)
      return NextResponse.json({ error: viewsError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "RLS policies set up successfully" })
  } catch (error) {
    console.error("Error in setup-rls API:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
