import { ImageResponse } from "next/og"
import { createServerClient } from "@/lib/supabase/server"

// Route segment config
export const runtime = "edge"
export const contentType = "image/png"
export const size = {
  width: 1200,
  height: 630,
}

export default async function TwitterImage({ params }: { params: { id: string } }) {
  // Get image data
  const supabase = createServerClient()
  const { data: image } = await supabase.from("images").select("*").eq("id", params.id).single()

  // If image not found, use generic placeholder
  if (!image) {
    return new ImageResponse(
      <div
        style={{
          fontSize: 48,
          background: "black",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
        }}
      >
        Image not found
      </div>,
      { ...size },
    )
  }

  // Return the image directly for clean embeds
  const imageUrl = image.public_url

  // We'll fetch the image and return it directly
  try {
    const imageData = await fetch(imageUrl).then((r) => r.arrayBuffer())
    return new Response(imageData, {
      headers: {
        "Content-Type": image.content_type || "image/png",
      },
    })
  } catch (e) {
    // Fallback to a generated image
    return new ImageResponse(
      <div
        style={{
          fontSize: 48,
          background: "black",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
        }}
      >
        IHP Image
      </div>,
      { ...size },
    )
  }
}
