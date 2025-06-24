import { NextRequest, NextResponse } from "next/server"
import { getImage } from "@/lib/memory-store"

interface RouteParams {
  params: Promise<{
    filename: string
  }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { filename } = await params
    const image = getImage(filename)

    if (!image) {
      return NextResponse.json(
        { error: "Image not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      image,
      note: "Retrieved from shared memory store"
    })
  } catch (error) {
    console.error("Error fetching image:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
