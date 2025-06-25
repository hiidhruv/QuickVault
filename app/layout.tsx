import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { GeistMono } from "geist/font/mono"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { Header } from "@/components/header"
import { AccessCheck } from "@/components/access-check"

export const metadata: Metadata = {
  title: "IHP - Image Hosting Protocol",
  description: "A simple image hosting and sharing platform",
  icons: {
    icon: "https://img.intercomm.in/v6q4or.png",
    apple: "https://img.intercomm.in/v6q4or.png",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="https://img.intercomm.in/v6q4or.png" />
        <link rel="apple-touch-icon" href="https://img.intercomm.in/v6q4or.png" />
      </head>
      <body className={GeistMono.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <AccessCheck>
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <footer className="py-6 border-t">
                <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
                  <p className="text-sm text-muted-foreground text-center md:text-left">
                    &copy; {new Date().getFullYear()} IHP. All rights reserved.
                  </p>
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
