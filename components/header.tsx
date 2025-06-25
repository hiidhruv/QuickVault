"use client"

import Link from "next/link"
import Image from "next/image"
import { Upload, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LogoutButton } from "@/components/logout-button"
import { ThemeToggle } from "@/components/theme-toggle"
import { SearchBar } from "@/components/search-bar"
import { useState } from "react"

export function Header() {
  const [showMobileSearch, setShowMobileSearch] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="page-container">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 mr-6">
              <div className="h-7 w-7 overflow-hidden">
                <Image
                  src="https://img.intercomm.in/v6q4or.png"
                  alt="IHP Logo"
                  width={28}
                  height={28}
                  priority
                  unoptimized
                />
              </div>
              <span className="font-bold">IHP</span>
            </Link>
            
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
                Home
              </Link>
              <Link
                href="/gallery"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                Gallery
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            <SearchBar className="hidden md:block w-64" placeholder="Search by title or category..." />
            
            {/* Mobile search toggle */}
            <Button 
              size="sm" 
              variant="ghost" 
              className="md:hidden"
              onClick={() => setShowMobileSearch(!showMobileSearch)}
            >
              <Search className="h-4 w-4" />
            </Button>
            
            <ThemeToggle />
            <Link href="/upload">
              <Button size="sm" className="hidden sm:inline-flex">
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </Button>
              <Button size="sm" variant="outline" className="sm:hidden">
                <Upload className="h-4 w-4" />
              </Button>
            </Link>
            <LogoutButton />
          </div>
        </div>
        
        {/* Mobile search bar */}
        {showMobileSearch && (
          <div className="md:hidden pb-3 -mt-1">
            <SearchBar placeholder="Search by title or category..." />
          </div>
        )}
      </div>
    </header>
  )
}
