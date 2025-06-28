import type React from "react"
import "./globals.css"
import type { Metadata, Viewport } from "next"
import Link from "next/link"
import { GeistMono } from "geist/font/mono"
import { Cherry_Bomb_One } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { Header } from "@/components/header"
import { AccessCheck } from "@/components/access-check"

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
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
