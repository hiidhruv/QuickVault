"use client"

import { useState, useEffect, useTransition, useCallback } from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"

interface SearchBarProps {
  className?: string
  placeholder?: string
}

export function SearchBar({ className, placeholder = "Search images..." }: SearchBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState(searchParams.get("search") || "")
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null)

  // Update search value when URL changes
  useEffect(() => {
    setSearch(searchParams.get("search") || "")
  }, [searchParams])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer)
      }
    }
  }, [debounceTimer])

  const updateURL = useCallback((value: string) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams)
      
      if (value) {
        params.set("search", value)
      } else {
        params.delete("search")
      }
      
      // Keep category filter if it exists
      const category = searchParams.get("category")
      if (category) {
        params.set("category", category)
      }
      
      router.push(`/gallery?${params.toString()}`)
    })
  }, [router, searchParams])

  const handleSearch = (value: string) => {
    // Update local state immediately for responsive typing
    setSearch(value)
    
    // Clear existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }
    
    // Set new timer to update URL after user stops typing
    const timer = setTimeout(() => {
      updateURL(value)
    }, 300) // 300ms delay
    
    setDebounceTimer(timer)
  }

  const clearSearch = () => {
    setSearch("")
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }
    updateURL("")
  }

  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
        className="pl-9 pr-10"
      />
      {search && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
          onClick={clearSearch}
        >
          <X className="h-3 w-3" />
          <span className="sr-only">Clear search</span>
        </Button>
      )}
    </div>
  )
} 