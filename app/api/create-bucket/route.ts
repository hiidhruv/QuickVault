import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

// This endpoint creates the necessary storage bucket if it doesn't exist
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

    // Check if bucket exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

    if (bucketsError) {
      console.error("Error listing buckets:", bucketsError)
      return NextResponse.json({ error: bucketsError.message }, { status: 500 })
    }

    const bucketExists = buckets.some((bucket) => bucket.name === "images")

    if (!bucketExists) {
      // Create the bucket
      const { data, error: createError } = await supabase.storage.createBucket("images", {
        public: true,
        fileSizeLimit: 10485760, // 10MB in bytes
      })

      if (createError) {
        console.error("Error creating bucket:", createError)
        return NextResponse.json({ error: createError.message }, { status: 500 })
      }

      // Set public bucket policy
      const { error: policyError } = await supabase.storage.from("images").createSignedUrl("test.txt", 1) // Just to test permissions

      if (policyError && !policyError.message.includes("not found")) {
        console.error("Error setting bucket policy:", policyError)
      }

      return NextResponse.json({ success: true, message: "Bucket created successfully", data })
    }

    return NextResponse.json({ success: true, message: "Bucket already exists" })
  } catch (error) {
    console.error("Error in create-bucket API:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
