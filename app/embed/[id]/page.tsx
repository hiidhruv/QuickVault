import { notFound } from "next/navigation"
import Image from "next/image"
import { createServerClient } from "@/lib/supabase/server"

export const metadata = {
  title: "Image",
  description: "Image",
}

interface EmbedPageProps {
  params: {
    id: string
  }
}

export default async function EmbedPage({ params }: EmbedPageProps) {
  const supabase = createServerClient()

  const { data: image } = await supabase.from("images").select("*").eq("id", params.id).single()

  if (!image) {
    notFound()
  }

  // Check if the image is from catbox.moe
  const isCatboxImage = image.public_url.includes("catbox.moe")

  // Return only the image with no surrounding elements
  return (
    <Image
      src={image.public_url || "/placeholder.svg"}
      alt=""
      fill
      className="object-contain"
      priority
      unoptimized={isCatboxImage}
    />
  )
}
