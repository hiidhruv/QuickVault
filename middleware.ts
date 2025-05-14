import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  // Add CORS headers for image API routes
  if (req.nextUrl.pathname.startsWith("/api/images/")) {
    const response = NextResponse.next()

    // Add CORS headers
    response.headers.set("Access-Control-Allow-Origin", "*")
    response.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS")
    response.headers.set("Access-Control-Allow-Headers", "Content-Type")

    return response
  }

  // For embed routes, allow access without verification
  if (req.nextUrl.pathname.startsWith("/embed/")) {
    return NextResponse.next()
  }

  // For root-level image proxy routes (e.g., /image.jpg), allow access without verification
  if (req.nextUrl.pathname.match(/^\/[^/]+\.(jpg|jpeg|png|gif|webp)$/i)) {
    return NextResponse.next()
  }

  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Refresh session if needed
  await supabase.auth.getSession()

  return res
}

export const config = {
  matcher: ["/api/images/:path*", "/embed/:path*", "/:path*"],
}
