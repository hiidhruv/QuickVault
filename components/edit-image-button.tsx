"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Edit, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import type { Database } from "@/lib/database.types"

type MediaType = Database["public"]["Tables"]["images"]["Row"]

interface EditImageButtonProps {
  media: MediaType
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

export function EditImageButton({ 
  media, 
  variant = "outline",
  size = "sm",
  className 
}: EditImageButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(media.title || "")
  const [description, setDescription] = useState(media.description || "")
  const [category, setCategory] = useState(media.category || "uncategorized")
  const [customCategory, setCustomCategory] = useState("")
  const [userCategories, setUserCategories] = useState<string[]>([])
  
  const router = useRouter()
  const { toast } = useToast()

  // Fetch existing categories from database
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories")
        const data = await response.json()
        setUserCategories(data.categories || [])
      } catch (error) {
        console.error("Error fetching categories:", error)
      }
    }
    fetchCategories()
  }, [])

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      setTitle(media.title || "")
      setDescription(media.description || "")
      setCategory(media.category || "uncategorized")
      setCustomCategory("")
    }
  }, [isOpen, media])

  const getSelectedCategory = () => {
    return category === "custom" ? customCategory : category
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const finalCategory = getSelectedCategory()
    if (!finalCategory.trim()) {
      toast({
        title: "Category required",
        description: "Please select or enter a category",
        variant: "destructive",
      })
      return
    }

    setIsEditing(true)

    try {
      const response = await fetch(`/api/edit?id=${media.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim() || null,
          description: description.trim() || null,
          category: finalCategory,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update media')
      }

      toast({
        title: "Media updated",
        description: "Your changes have been saved successfully",
      })

      setIsOpen(false)
      router.refresh()
    } catch (error) {
      console.error('Edit error:', error)
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update media",
        variant: "destructive",
      })
    } finally {
      setIsEditing(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <Edit className="h-4 w-4" />
          {size !== "icon" && <span className="ml-1">Edit</span>}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Media</DialogTitle>
          <DialogDescription>
            Update the title, description, and category for this media.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a title for your media"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="uncategorized">Uncategorized</SelectItem>
                  {userCategories.length > 0 && (
                    <>
                      <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Your Categories</div>
                      {userCategories.map((cat) => (
                        <SelectItem key={cat} value={cat} className="capitalize">
                          {cat}
                        </SelectItem>
                      ))}
                    </>
                  )}
                  <SelectItem value="custom">+ Custom Category</SelectItem>
                </SelectContent>
              </Select>
              {category === "custom" && (
                <Input
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="Enter custom category"
                  className="mt-2"
                  autoFocus
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description for your media"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              disabled={isEditing}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isEditing}>
              {isEditing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}