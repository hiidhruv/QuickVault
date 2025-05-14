"use client"

import { useState } from "react"
import { Trash, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
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

export function GalleryActions() {
  const [showDeleteAllAlert, setShowDeleteAllAlert] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleDeleteAll = async () => {
    setIsDeleting(true)

    try {
      const response = await fetch("/api/delete-all", {
        method: "DELETE",
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Images deleted",
          description: `Successfully deleted ${result.count} images`,
        })
        router.refresh()
      } else {
        throw new Error(result.error || "Failed to delete images")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete images",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setShowDeleteAllAlert(false)
    }
  }

  return (
    <>
      <Button variant="destructive" size="sm" onClick={() => setShowDeleteAllAlert(true)}>
        <Trash className="h-4 w-4 mr-2" />
        Delete All
      </Button>

      <AlertDialog open={showDeleteAllAlert} onOpenChange={setShowDeleteAllAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete all images?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete all images from the gallery.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDeleteAll()
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isDeleting ? "Deleting..." : "Delete All"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
