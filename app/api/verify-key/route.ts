import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { key } = await request.json()

    // Get the access key from environment variable
    const validKey = process.env.ACCESS_KEY || "ur_mom69"

    // Check if the provided key matches
    const isValid = key === validKey

    return NextResponse.json({ success: isValid })
  } catch (error) {
    console.error("Error verifying key:", error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
