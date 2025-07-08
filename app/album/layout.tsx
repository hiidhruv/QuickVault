import type React from "react"
import { GeistMono } from "geist/font/mono"
import { Cherry_Bomb_One } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import "../globals.css"

const cherryBomb = Cherry_Bomb_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-cherry-bomb",
})

export default function AlbumLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, shrink-to-fit=no" />
        <link rel="icon" href="https://img.intercomm.in/v6q4or.png" />
        <link rel="apple-touch-icon" href="https://img.intercomm.in/v6q4or.png" />
      </head>
      <body className={`${GeistMono.className} ${cherryBomb.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {/* No AccessCheck wrapper - public albums don't need authentication */}
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
} 