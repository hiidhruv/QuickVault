"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { AccessCheck } from "@/components/access-check"
import { Header } from "@/components/header"

interface ConditionalAccessCheckProps {
  children: React.ReactNode
}

export function ConditionalAccessCheck({ children }: ConditionalAccessCheckProps) {
  const pathname = usePathname()
  
  // Skip access check for public album routes
  const isPublicAlbumRoute = pathname.startsWith('/album/')
  
  if (isPublicAlbumRoute) {
    // For public albums, render without header/footer and without access check
    return <>{children}</>
  }
  
  // For regular app routes, include access check, header, and footer
  return (
    <AccessCheck>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-16">{children}</main>
        <footer className="py-6 border-t">
          <div className="container flex items-center justify-center">
            <Link 
              href="https://dhrv.dev" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              QV - dhrv.dev
            </Link>
          </div>
        </footer>
      </div>
    </AccessCheck>
  )
} 