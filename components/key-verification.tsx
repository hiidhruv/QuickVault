"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

const STORAGE_KEY = "imgur_lite_access"

export function KeyVerification() {
  const [key, setKey] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    // Check if already verified
    const hasAccess = localStorage.getItem(STORAGE_KEY) === "true"
    if (hasAccess) {
      router.refresh()
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsVerifying(true)

    try {
      // Call the server-side verification API
      const response = await fetch("/api/verify-key", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ key }),
      })

      const data = await response.json()

      if (data.success) {
        // Store access in localStorage
        localStorage.setItem(STORAGE_KEY, "true")
        toast({
          title: "Access granted",
          description: "Welcome to IHP",
        })
        router.refresh()
      } else {
        toast({
          title: "Access denied",
          description: "Invalid key provided",
          variant: "destructive",
        })
        setKey("")
      }
    } catch (error) {
      toast({
        title: "Verification failed",
        description: "There was an error verifying your key",
        variant: "destructive",
      })
      console.error("Key verification error:", error)
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-muted/40">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col items-center">
          <div className="mb-4 w-20 h-20 overflow-hidden">
            <Image
              src="https://img.intercomm.in/v6q4or.png"
              alt="IHP Logo"
              width={80}
              height={80}
              className="h-20 w-20"
              unoptimized
            />
          </div>
          <CardTitle>IHP - Image Hosting Protocol</CardTitle>
          <CardDescription>
            This is a private image hosting service. Please enter the access key to continue.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Input
                  id="key"
                  type="password"
                  placeholder="Enter access key"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isVerifying}>
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Access Gallery"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
