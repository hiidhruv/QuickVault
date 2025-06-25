import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient<Database>(supabaseUrl, supabaseKey)

export async function GET() {
  try {
    // Fetch all unique categories from the images table
    const { data: images, error } = await supabase
      .from('images')
      .select('category')
      .not('category', 'is', null)

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ categories: [] })
    }

    // Extract unique categories and filter out empty strings
    const uniqueCategories = [...new Set(
      images
        .map(img => img.category)
        .filter(cat => cat && cat.trim() !== '' && cat !== 'uncategorized')
    )]

    // Sort alphabetically
    uniqueCategories.sort((a, b) => a!.toLowerCase().localeCompare(b!.toLowerCase()))

    return NextResponse.json({ 
      categories: uniqueCategories 
    })
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json({ categories: [] })
  }
} 