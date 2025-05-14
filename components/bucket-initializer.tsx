"use client"

import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"

export function BucketInitializer() {
  const [initialized, setInitialized] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const initBucket = async () => {
      try {
        const response = await fetch("/api/create-bucket")
        const data = await response.json()

        if (!response.ok) {
          console.error("Bucket initialization failed:", data)
          // Don't show error toast to users - just log it
          setInitialized(false)
          return
        }

        setInitialized(true)
      } catch (error) {
        console.error("Bucket initialization error:", error)
        // Don't show error toast to users - just log it
        setInitialized(false)
      }
    }

    initBucket()
  }, [])

  return null // This component doesn't render anything
}
