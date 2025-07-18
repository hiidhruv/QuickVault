import type React from "react"
import "./globals.css"
import type { Metadata, Viewport } from "next"
import Link from "next/link"
import { GeistMono } from "geist/font/mono"
import { Cherry_Bomb_One } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { Header } from "@/components/header"
import { ConditionalAccessCheck } from "@/components/conditional-access-check"

const cherryBomb = Cherry_Bomb_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-cherry-bomb",
})

export const metadata: Metadata = {
  title: "QV - QuickVault",
  description: "A simple media hosting and sharing platform",
  icons: {
    icon: "https://img.intercomm.in/v6q4or.png",
    apple: "https://img.intercomm.in/v6q4or.png",
  },
}

// Modern Next.js viewport configuration
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default function RootLayout({
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
          <ConditionalAccessCheck>
            {children}
          </ConditionalAccessCheck>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
