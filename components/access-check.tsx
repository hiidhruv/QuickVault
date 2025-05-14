"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { KeyVerification } from "@/components/key-verification"

export function AccessCheck({ children }: { children: React.ReactNode }) {
  const [hasAccess, setHasAccess] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if the user has access
    const accessGranted = localStorage.getItem("imgur_lite_access") === "true"
    setHasAccess(accessGranted)
    setIsLoading(false)
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
    return <KeyVerification />
  }

  // Show the app if access is granted
  return <>{children}</>
}
