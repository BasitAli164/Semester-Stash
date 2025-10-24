import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: [],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NODE_ENV === 'development' 
          ? 'http://127.0.0.1:5000/api/:path*'
          : '/api/',
      },
    ]
  },
  images: {
    domains: ['localhost'],
  },
}

export default nextConfig