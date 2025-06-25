"use client"

import { CopyButton } from "@/components/copy-button"

interface ImageCopyButtonProps {
  id: string
}

export function ImageCopyButton({ id }: ImageCopyButtonProps) {
  const url = typeof window !== "undefined" 
    ? `${window.location.origin}/i/${id}`
    : `/i/${id}`

  return (
    <CopyButton 
      value={url}
      label="Copy link"
      variant="default"
      size="default"
    />
  )
} 