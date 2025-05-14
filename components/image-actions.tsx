"use client"

import { useState } from "react"
import { Copy, Link, Trash, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { deleteImage } from "@/app/i/[id]/actions"
import type { Database } from "@/lib/database.types"
import { getShareableImageUrl } from "@/lib/utils"

type Image = Database["public"]["Tables"]["images"]["Row"]

interface ImageActionsProps {
  image: Image
}

export function ImageActions({ image }: ImageActionsProps) {
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied!",
        description: message,
      })
    })
  }

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      const result = await deleteImage(image.id)

      if (result.success) {
        toast({
          title: "Image deleted",
          description: "The image has been permanently deleted",
        })
        router.push("/")
      } else {
        throw new Error(result.error || "Failed to delete image")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the image",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setShowDeleteAlert(false)
    }
  }

  // Generate URLs with the correct domain
  const imageUrl = getShareableImageUrl(image.id)
  const directImageUrl = image.public_url
  const embedHtml = `<a href="${imageUrl}"><img src="${directImageUrl}" alt="${image.title || "IHP image"}" /></a>`
  const markdownLink = `![${image.title || "IHP image"}](${directImageUrl})`

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => copyToClipboard(directImageUrl, "Direct image URL copied to clipboard")}
        >
          <Copy className="h-4 w-4 mr-2" />
          Copy URL
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Link className="h-4 w-4 mr-2" />
              Share
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => copyToClipboard(imageUrl, "Image page URL copied to clipboard")}>
              Copy page URL
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => copyToClipboard(directImageUrl, "Direct image URL copied to clipboard")}>
              Copy direct URL
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => copyToClipboard(embedHtml, "HTML embed code copied to clipboard")}>
              Copy HTML embed
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => copyToClipboard(markdownLink, "Markdown link copied to clipboard")}>
              Copy Markdown link
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => setShowDeleteAlert(true)}
            >
              <Trash className="h-4 w-4 mr-2" />
              Delete image
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the image and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDelete()
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
