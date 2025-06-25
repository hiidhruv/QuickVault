"use client"

import { CopyButton } from "@/components/copy-button"

interface ImageCopyButtonProps {
  id?: string
  mediaUrl?: string
}

export function ImageCopyButton({ id, mediaUrl }: ImageCopyButtonProps) {
  // If mediaUrl is provided directly, use it
  // Otherwise fall back to page URL (for backward compatibility)
  const url = mediaUrl || (typeof window !== "undefined" 
    ? `${window.location.origin}/i/${id}`
    : `/i/${id}`)

  return (
    <CopyButton 
      value={url}
      label="Copy media link"
      variant="default"
      size="default"
    />
  )
} 