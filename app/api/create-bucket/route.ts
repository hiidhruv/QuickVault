import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

// This endpoint creates the necessary storage bucket if it doesn't exist
export async function POST() {
  try {
    const supabase = createServerComponentClient(
      { cookies },
      {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      },
    )

    // Check if the bucket already exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      console.error("Error listing buckets:", bucketsError)
      return NextResponse.json({ success: false, error: "Failed to list buckets" }, { status: 500 })
    }

    const bucketExists = buckets?.some(bucket => bucket.name === "images")
    
    if (bucketExists) {
      return NextResponse.json({ success: true, message: "Bucket already exists" })
    }

    // Create the bucket with public access
    const { data, error: createError } = await supabase.storage.createBucket("images", {
      public: true,
    })

    if (createError) {
      console.error("Error creating bucket:", createError)
      return NextResponse.json({ success: false, error: "Failed to create bucket" }, { status: 500 })
    }

    // Test permissions by creating a signed URL
    const { error: policyError } = await supabase.storage.from("images").createSignedUrl("test.txt", 1) // Just to test permissions

    return NextResponse.json({ 
      success: true, 
      bucket: data,
      permissionsTest: !policyError
    })
  } catch (error) {
    console.error("Bucket creation error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
