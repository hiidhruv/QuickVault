"use client"

import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export function LogoutButton() {
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem("imgur_lite_access")
    router.refresh()
  }

  return (
    <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
      <LogOut className="h-4 w-4" />
    </Button>
  )
}
