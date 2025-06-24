"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Filter, X } from "lucide-react"

interface CategoryFilterProps {
  categories: string[]
  selectedCategory?: string
}

export function CategoryFilter({ categories, selectedCategory }: CategoryFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleCategoryChange = (category: string) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (category === "all") {
      params.delete("category")
    } else {
      params.set("category", category)
    }
    
    router.push(`/gallery?${params.toString()}`)
  }

  const clearFilter = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete("category")
    router.push(`/gallery?${params.toString()}`)
  }

  if (categories.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="h-4 w-4" />
          <span>Filter by category:</span>
        </div>
        
        {/* Desktop: Show as buttons */}
        <div className="hidden sm:flex flex-wrap gap-2">
          <Button
            variant={!selectedCategory || selectedCategory === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => handleCategoryChange("all")}
          >
            All
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => handleCategoryChange(category)}
              className="capitalize"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Mobile: Show as select */}
        <div className="sm:hidden w-full">
          <Select value={selectedCategory || "all"} onValueChange={handleCategoryChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category} className="capitalize">
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Show active filter badge */}
      {selectedCategory && selectedCategory !== "all" && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="capitalize">
            {selectedCategory}
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 ml-2 text-muted-foreground hover:text-foreground"
              onClick={clearFilter}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        </div>
      )}
    </div>
  )
} 