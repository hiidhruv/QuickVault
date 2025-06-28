"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { KeyVerification } from "@/components/key-verification"

export function AccessCheck({ children }: { children: React.ReactNode }) {
  const [hasAccess, setHasAccess] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const checkAccess = () => {
    const accessGranted = localStorage.getItem("imgur_lite_access") === "true"
    setHasAccess(accessGranted)
    return accessGranted
  }

  useEffect(() => {
    // Initial check
    checkAccess()
    setIsLoading(false)

    // Listen for localStorage changes (for when KeyVerification component updates it)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "imgur_lite_access") {
        checkAccess()
      }
    }

    // Listen for custom events (we'll dispatch this from KeyVerification)
    const handleAccessGranted = () => {
      checkAccess()
    }

    // Add event listeners
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('accessGranted', handleAccessGranted)

    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('accessGranted', handleAccessGranted)
    }
  }, [])

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Show key verification if no access
  if (!hasAccess) {
    return <KeyVerification onAccessGranted={() => setHasAccess(true)} />
  }

  // Show the app if access is granted
  return <>{children}</>
}
