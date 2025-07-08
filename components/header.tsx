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
    <header className="fixed top-0 left-0 right-0 z-[100] w-full border-b bg-background/70 backdrop-blur-md border-border/30">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3 mr-6">
              <div className="h-10 w-10 overflow-hidden">
                <Image
                  src="https://img.intercomm.in/v6q4or.png"
                  alt="QV Logo"
                  width={40}
                  height={40}
                  priority
                  unoptimized
                />
              </div>
              <span className="font-cherry-bomb text-2xl font-normal tracking-wide">QV</span>
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
              <Link
                href="/albums"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                Albums
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
          <div className="md:hidden pb-3 -mt-1 max-w-7xl mx-auto">
            <SearchBar placeholder="Search by title or category..." />
          </div>
        )}
      </div>
    </header>
  )
}
