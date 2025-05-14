/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'img.intercomm.in'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: '/i/:path*',
        destination: '/i/:path*',
      },
      {
        source: '/gallery',
        destination: '/gallery',
      },
      {
        source: '/api/images/:path*',
        destination: '/api/images/:path*',
      },
    ]
  },
  env: {
    // Add a fallback for ACCESS_KEY
    ACCESS_KEY: process.env.ACCESS_KEY || 'ur_mom69',
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

export default nextConfig
