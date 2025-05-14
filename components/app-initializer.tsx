"use client"

import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"

export function AppInitializer() {
  const [initialized, setInitialized] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const initApp = async () => {
      try {
        // Initialize storage bucket
        await fetch("/api/create-bucket")

        // Set up RLS policies
        await fetch("/api/setup-rls")

        setInitialized(true)
      } catch (error) {
        console.error("App initialization error:", error)
        // Don't show error toast to users - just log it
      }
    }

    initApp()
  }, [])

  return null // This component doesn't render anything
}
