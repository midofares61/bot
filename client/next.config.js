/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
    NEXT_PUBLIC_FACEBOOK_APP_ID: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID,
    NEXT_PUBLIC_CLIENT_URL: process.env.NEXT_PUBLIC_CLIENT_URL || 'http://localhost:3000',
    NEXT_PUBLIC_FACEBOOK_API_VERSION: process.env.NEXT_PUBLIC_FACEBOOK_API_VERSION || 'v18.0',
  },
  images: {
    domains: ['graph.facebook.com', 'platform-lookaside.fbsbx.com'],
  },
  // Vercel optimization
  experimental: {
    outputStandalone: true,
  },
  // Handle API routes
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ]
  },
}

module.exports = nextConfig
