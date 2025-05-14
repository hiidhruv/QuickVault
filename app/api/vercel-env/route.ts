import { NextResponse } from "next/server"

// This endpoint is used to check environment variables
export async function GET() {
  return NextResponse.json({
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || null,
    VERCEL_URL: process.env.VERCEL_URL || null,
    hostname: typeof window !== "undefined" ? window.location.hostname : null,
  })
}
