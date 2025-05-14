import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// This endpoint is needed because Supabase doesn't support increment operations directly
export async function POST(request: Request) {
  try {
    const { id } = await request.json()

    if (!id) {
      return NextResponse.json({ error: "Missing id parameter" }, { status: 400 })
    }

    const supabase = createServerClient()

    // Get current count
    const { data, error } = await supabase.from("images").select("view_count").eq("id", id).single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Increment count
    const { error: updateError } = await supabase
      .from("images")
      .update({ view_count: (data.view_count || 0) + 1 })
      .eq("id", id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
