import type { NextRequest } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { filename: string } }) {
  const filename = params.filename

  if (!filename) {
    return new Response("Filename is required", { status: 400 })
  }

  try {
    // Reconstruct the original catbox URL
    const originalUrl = `https://files.catbox.moe/${filename}`

    // Fetch the image from catbox
    const response = await fetch(originalUrl)

    if (!response.ok) {
      return new Response("Image not found", { status: 404 })
    }

    // Get the content type from the response
    const contentType = response.headers.get("content-type") || "image/jpeg"

    // Get the image data
    const imageData = await response.arrayBuffer()

    // Return the image with appropriate headers
    return new Response(imageData, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable", // Cache for 1 year
      },
    })
  } catch (error) {
    console.error("Error proxying image:", error)
    return new Response("Error fetching image", { status: 500 })
  }
}
